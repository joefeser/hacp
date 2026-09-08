import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  buildCorpus,
  digestClaim,
  validateAttestation,
} from './validate-packet-assembly-attestation.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(repoRoot, 'schemas/experimental/packet-assembly-attestation/v0.1-draft');
const schema = JSON.parse(await readFile(
  path.join(packageRoot, 'packet-assembly-attestation.schema.json'),
  'utf8',
));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);
const corpus = await buildCorpus();
const valid = corpus.files.get('valid/packet-assembly-attestation.valid.json');

test('valid fixtures authenticate every advertised content representation', async () => {
  for (const item of corpus.manifest.expectedValid) {
    const record = corpus.files.get(item.path);
    assert.deepEqual(
      await validateAttestation(record, corpus.verificationContext, validateSchema),
      [],
      item.path,
    );
  }
});

test('all negative fixtures fail with their exact declared diagnostic', async () => {
  for (const item of corpus.manifest.expectedInvalid) {
    const record = corpus.files.get(item.path);
    const actual = (await validateAttestation(
      record,
      corpus.verificationContext,
      validateSchema,
    )).map((entry) => entry.code);
    assert.deepEqual(actual, item.expectedCodes, item.path);
  }
});

test('a bare createdBy assertion is rejected by the closed record shape', async () => {
  const record = { ...structuredClone(valid), createdBy: 'agent-claimed-builder' };
  assert.deepEqual(
    (await validateAttestation(record, corpus.verificationContext, validateSchema)).map((entry) => entry.code),
    ['SCHEMA_VALIDATION_FAILED'],
  );
});

test('the signature covers role separation and non-authority boundaries', async () => {
  for (const mutate of [
    (record) => { record.builder.principalId = 'principal://example.invalid/other'; },
    (record) => { record.boundaryStatement = 'builder also approves'; },
    (record) => { record.limitations = ['claims correct construction']; },
  ]) {
    const record = structuredClone(valid);
    mutate(record);
    assert.notDeepEqual(record.claimDigest, digestClaim(record));
    assert.deepEqual(
      (await validateAttestation(record, corpus.verificationContext, validateSchema)).map((entry) => entry.code),
      record.boundaryStatement === valid.boundaryStatement
        ? ['CLAIM_DIGEST_MISMATCH']
        : ['SCHEMA_VALIDATION_FAILED'],
    );
  }
});

test('the published v0.3-candidate task-packet schema remains unchanged in meaning', async () => {
  const candidate = JSON.parse(await readFile(
    path.join(repoRoot, 'schemas/v0.3-candidate/task-packet.schema.json'),
    'utf8',
  ));
  assert.equal(candidate.properties.recordKind.const, 'hacp.v0_3_candidate.task_packet');
  assert.equal(candidate.properties.schemaVersion.const, 'hacp-0.3-candidate');
  assert.equal(Object.hasOwn(candidate.properties, 'builder'), false);
  assert.equal(Object.hasOwn(candidate.properties, 'packetAssemblyAttestation'), false);
});
