import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import {
  loadExternalManifestValidator,
  safeRelativeRecordPath,
  validateExternalBundleRoot
} from './validate-external-bundle.mjs';

const repoRoot = process.cwd();
const fixtureRoot = path.join(repoRoot, 'schemas/v0.3-candidate/fixtures');
const canonicalManifestPath = path.join(fixtureRoot, 'manifest.json');
const schemaRoot = path.join(repoRoot, 'schemas/v0.3-candidate');
const schemaFiles = [
  'common-defs.schema.json',
  'task-packet.schema.json',
  'review-finding.schema.json',
  'human-decision.schema.json',
  'consumption-receipt.schema.json',
  'continuation-context.schema.json',
  'agent-report.schema.json',
  'stop-response.schema.json'
];
const digestDomains = [
  'org.hacp.task-packet.v0.3-candidate',
  'org.hacp.human-decision.v0.3-candidate',
  'org.hacp.consumption-receipt.v0.3-candidate',
  'org.hacp.continuation-context.v0.3-candidate',
  'org.hacp.agent-report.v0.3-candidate',
  'org.hacp.review-finding.v0.3-candidate',
  'org.hacp.stop-response.v0.3-candidate',
  'org.hacp.successor-start-evidence.v0.3-candidate'
];

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function createExternalRoot() {
  const root = await mkdtemp(path.join(tmpdir(), 'hacp-v03-external-'));
  const canonicalBytes = await readFile(canonicalManifestPath);
  const canonical = JSON.parse(canonicalBytes.toString('utf8'));
  const recordSchemaSha256 = Object.fromEntries(await Promise.all(schemaFiles.map(async (file) => [
    file, sha256(await readFile(path.join(schemaRoot, file)))
  ])));
  const translatedPath = (value) => `records/${value.replace(/^valid\//, '')}`;
  const inventory = [];
  for (const item of canonical.fixtureInventory) {
    const destination = translatedPath(item.path);
    const sourceFile = path.join(fixtureRoot, item.path);
    const destinationFile = path.join(root, destination);
    await mkdir(path.dirname(destinationFile), { recursive: true });
    await copyFile(sourceFile, destinationFile);
    inventory.push({
      path: destination,
      schema: item.schema,
      sha256: sha256(await readFile(destinationFile))
    });
  }
  const manifest = {
    schema: 'hacp.v0_3_candidate.external_bundle_manifest.v1',
    candidateStatus: true,
    qualificationIntent: 'independent_production_plus_cross_validation',
    conformancePackage: {
      manifestSha256: sha256(canonicalBytes),
      schemaBaseUri: 'https://hacp.example/schemas/v0.3-candidate/',
      recordSchemaSha256,
      semanticValidatorSha256: sha256(await readFile(path.join(repoRoot, 'scripts/compute-vectors.mjs'))),
      digestDomains
    },
    producer: {
      implementationId: 'org.example.independent-producer.v0',
      sourceRepository: 'https://example.test/independent-producer',
      sourceCommit: 'a'.repeat(40),
      generatedAt: '2026-09-06T12:00:00Z'
    },
    fixtureInventory: inventory,
    bundles: canonical.expectedValidBundles.map((bundle) => ({
      ...bundle,
      records: bundle.records.map((item) => ({ ...item, path: translatedPath(item.path) }))
    }))
  };
  await writeFile(path.join(root, 'external-bundle-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return { root, manifest };
}

async function withExternalRoot(run) {
  const fixture = await createExternalRoot();
  try {
    await run(fixture);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
}

async function writeManifest(root, manifest) {
  await writeFile(path.join(root, 'external-bundle-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

test('external manifest schema is closed and fixes all candidate identifiers', async () => {
  await withExternalRoot(async ({ manifest }) => {
    const validate = await loadExternalManifestValidator();
    assert.equal(validate(manifest), true);
    assert.equal(validate({ ...manifest, executableProvider: 'no' }), false);
    const reordered = structuredClone(manifest);
    reordered.conformancePackage.digestDomains.reverse();
    assert.equal(validate(reordered), false);
  });
});

test('external producer passes all bundles after canonical package and negative corpus verification', async () => {
  await withExternalRoot(async ({ root }) => {
    const result = await validateExternalBundleRoot(root);
    assert.equal(result.ok, true);
    assert.equal(result.candidateOnly, true);
    assert.equal(result.conformancePackage.canonicalNegativeCases, 22);
    assert.equal(result.conformancePackage.diagnosticSetsComparedExactly, true);
    assert.deepEqual(result.bundles.map((item) => [item.kind, item.records]), [
      ['successful_continuation', 6],
      ['pre_start_stop', 4],
      ['stop_decision_response', 5]
    ]);
  });
});

test('external admission rejects a stale conformance-package pin', async () => {
  await withExternalRoot(async ({ root, manifest }) => {
    manifest.conformancePackage.manifestSha256 = '0'.repeat(64);
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_PACKAGE_PIN_MISMATCH/);
  });
  await withExternalRoot(async ({ root, manifest }) => {
    manifest.conformancePackage.recordSchemaSha256['agent-report.schema.json'] = '0'.repeat(64);
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_PACKAGE_SCHEMA_PIN_MISMATCH/);
  });
  await withExternalRoot(async ({ root, manifest }) => {
    manifest.conformancePackage.semanticValidatorSha256 = '0'.repeat(64);
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_PACKAGE_VALIDATOR_PIN_MISMATCH/);
  });
});

test('external admission rejects digest drift and semantic drift independently', async () => {
  await withExternalRoot(async ({ root, manifest }) => {
    const item = manifest.fixtureInventory[0];
    const file = path.join(root, item.path);
    const record = JSON.parse(await readFile(file, 'utf8'));
    record.packetId = 'taskpkt_changed_without_record_digest';
    await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_FILE_DIGEST_MISMATCH/);

    item.sha256 = sha256(await readFile(file));
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_BUNDLE_INVALID: successful_continuation.*DIGEST_MISMATCH/);
  });
});

test('external admission rejects undeclared files and uncovered inventory', async () => {
  await withExternalRoot(async ({ root }) => {
    await writeFile(path.join(root, 'records/extra.json'), '{}\n');
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_FILE_INVENTORY_MISMATCH/);
  });
  await withExternalRoot(async ({ root, manifest }) => {
    manifest.bundles[0].records[0].path = manifest.bundles[1].records[0].path;
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_BUNDLE_INVENTORY_MISMATCH|EXTERNAL_UNCOVERED_INVENTORY/);
  });
});

test('external stop branches must share exact antecedent paths', async () => {
  await withExternalRoot(async ({ root, manifest }) => {
    manifest.bundles[2].records[0].path = manifest.bundles[0].records[0].path;
    await writeManifest(root, manifest);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_SHARED_ANTECEDENT_INVALID/);
  });
});

test('external paths reject traversal, absolute paths, backslashes, and symlinks', async () => {
  for (const value of ['../record.json', '/tmp/record.json', 'records\\record.json', 'records/a/../record.json']) {
    assert.throws(() => safeRelativeRecordPath(value), /EXTERNAL_PATH_INVALID/);
  }
  await withExternalRoot(async ({ root, manifest }) => {
    const item = manifest.fixtureInventory[0];
    const original = path.join(root, item.path);
    const target = `${original}.target`;
    await copyFile(original, target);
    await rm(original);
    await symlink(target, original);
    await assert.rejects(() => validateExternalBundleRoot(root), /EXTERNAL_PATH_SYMLINK/);
  });
});
