#!/usr/bin/env node

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import canonicalize from 'canonicalize';
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  verify,
} from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(
  repoRoot,
  'schemas/experimental/packet-assembly-attestation/v0.1-draft',
);
const fixtureRoot = path.join(packageRoot, 'fixtures');
const schemaPath = path.join(packageRoot, 'packet-assembly-attestation.schema.json');
const subjectPacketPath = path.join(
  repoRoot,
  'schemas/v0.3-candidate/fixtures/valid/success/task-packet.valid.json',
);
const sourceSchemaPath = path.join(repoRoot, 'schemas/v0.3-candidate/task-packet.schema.json');

const CLAIM_DOMAIN = 'io.hacp.packet-assembly-attestation-claim.v0.1-draft';
const SOURCE_REF = 'repo://joefeser/hacp/schemas/v0.3-candidate/task-packet.schema.json';
const SOURCE_REVISION = 'git:671791f3e7568a57b8e97bea5ac7f8c9e7e74b06';
const EXPECTED_SOURCE_SHA256 = '9b7447bac08afcdb88ca5c275d1f897d6aff8a83f41e068bb79480f185da3dea';
const EXPECTED_PACKET_DIGEST = 'c330d201bd02c7176542740377ea5be9f9b0621b3ea67f7e8e520464a10d58a4';
const TRUST_PROFILE_REF = 'profile://example.invalid/packet-builder-test/v0.1';
const TRUSTED_PRINCIPAL = 'principal://example.invalid/packet-builder';
const TRUSTED_KEY_ID = 'key://example.invalid/packet-builder/fixture-ed25519-1';
const AUTHENTICATION_METHOD = 'profile_bound_ed25519_key';
const BOUNDARY_STATEMENT = 'This attestation binds an authenticated builder claim under an independently selected verification profile. It does not prove correct construction, source authenticity, human approval, runtime admission, execution, completion, or external effects.';

// RFC 8032 test-vector seeds. These are public fixture material, not secrets.
const TRUSTED_SEED = '9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60';
const UNTRUSTED_SEED = '4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb';

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function privateKeyFromSeed(seedHex) {
  const prefix = Buffer.from('302e020100300506032b657004220420', 'hex');
  return createPrivateKey({
    key: Buffer.concat([prefix, Buffer.from(seedHex, 'hex')]),
    format: 'der',
    type: 'pkcs8',
  });
}

export function contentDigest(bytes, representation = 'raw-bytes') {
  let digestInput;
  if (representation === 'raw-bytes') {
    digestInput = bytes;
  } else if (representation === 'git-blob') {
    digestInput = Buffer.concat([
      Buffer.from(`blob ${bytes.length}\0`, 'utf8'),
      bytes,
    ]);
  } else if (representation === 'json-rfc8785-jcs') {
    const serialized = canonicalize(JSON.parse(bytes.toString('utf8')));
    if (serialized === undefined) throw new Error('RFC 8785 content serialization failed.');
    digestInput = Buffer.from(serialized, 'utf8');
  } else {
    throw new Error(`Unsupported digest representation: ${representation}`);
  }
  return {
    algorithm: 'sha256',
    representation,
    value: createHash('sha256').update(digestInput).digest('hex'),
  };
}

function declaredArtifact(descriptor, artifactRef, representation = 'raw-bytes') {
  return {
    id: descriptor.id,
    version: descriptor.version,
    artifactRef,
    artifactDigest: contentDigest(
      Buffer.from(stableJson(descriptor), 'utf8'),
      representation,
    ),
  };
}

function equalDigest(left, right) {
  return left?.algorithm === right?.algorithm
    && left?.canonicalization === right?.canonicalization
    && left?.digestDomain === right?.digestDomain
    && left?.value === right?.value;
}

function claimRecord(attestation) {
  const record = structuredClone(attestation);
  delete record.claimDigest;
  delete record.cryptographicBinding;
  return record;
}

export function canonicalClaimInput(attestation) {
  const serialized = canonicalize({ domain: CLAIM_DOMAIN, record: claimRecord(attestation) });
  if (serialized === undefined) throw new Error('RFC 8785 claim serialization failed.');
  return Buffer.from(serialized, 'utf8');
}

export function digestClaim(attestation) {
  return {
    algorithm: 'sha256',
    canonicalization: 'json-rfc8785-jcs',
    digestDomain: CLAIM_DOMAIN,
    value: createHash('sha256').update(canonicalClaimInput(attestation)).digest('hex'),
  };
}

function finalizeAttestation(attestation, privateKey, keyId) {
  const next = claimRecord(attestation);
  next.claimDigest = digestClaim(next);
  next.cryptographicBinding = {
    scheme: 'ed25519',
    keyId,
    signature: sign(null, canonicalClaimInput(next), privateKey).toString('base64url'),
  };
  return next;
}

function candidatePacketDigest(packet) {
  const record = structuredClone(packet);
  const domain = record.digest.digestDomain;
  delete record.digest;
  const serialized = canonicalize({ domain, record });
  if (serialized === undefined) throw new Error('Candidate packet serialization failed.');
  return {
    algorithm: 'sha256',
    canonicalization: 'json-rfc8785-jcs',
    digestDomain: domain,
    value: createHash('sha256').update(serialized, 'utf8').digest('hex'),
  };
}

async function schemaValidator() {
  const schema = await readJson(schemaPath);
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

export async function buildCorpus() {
  const trustedPrivateKey = privateKeyFromSeed(TRUSTED_SEED);
  const untrustedPrivateKey = privateKeyFromSeed(UNTRUSTED_SEED);
  const trustedPublicKey = createPublicKey(trustedPrivateKey).export({ format: 'jwk' });
  const subjectPacket = await readJson(subjectPacketPath);
  const sourceBytes = await readFile(sourceSchemaPath);
  const resolvedSourceDigest = contentDigest(sourceBytes);

  if (!equalDigest(subjectPacket.digest, candidatePacketDigest(subjectPacket))
    || subjectPacket.digest.value !== EXPECTED_PACKET_DIGEST) {
    throw new Error('Pinned candidate task packet digest is not reproducible.');
  }
  if (resolvedSourceDigest.value !== EXPECTED_SOURCE_SHA256) {
    throw new Error('Pinned source revision no longer matches the expected source bytes.');
  }

  const constructionDescriptors = {
    profile: {
      kind: 'packet-assembly-construction-profile',
      id: 'org.hacp.fixture.packet-assembly',
      version: '0.1-test',
      transformationPolicy: 'select-declared-source-and-structure-bounded-fields',
      fixtureOnly: true,
    },
    tool: {
      kind: 'packet-assembly-tool-identity',
      id: 'fixture-packet-builder',
      version: '1.0.0-test',
      fixtureOnly: true,
    },
    runtime: {
      kind: 'packet-assembly-runtime-identity',
      id: 'nodejs-fixture-runtime',
      version: '24.14.0-test',
      fixtureOnly: true,
    },
  };
  const constructionRefs = {
    profile: 'fixture://packet-assembly/construction/profile.json',
    tool: 'fixture://packet-assembly/construction/tool.json',
    runtime: 'fixture://packet-assembly/construction/runtime.json',
  };

  const verificationContext = {
    schema: 'hacp.packet_assembly_attestation.fixture_verification_context.v1',
    fixtureOnly: true,
    profileRef: TRUST_PROFILE_REF,
    trustedBuilders: [
      {
        principalId: TRUSTED_PRINCIPAL,
        authenticationMethod: AUTHENTICATION_METHOD,
        keyId: TRUSTED_KEY_ID,
        publicKeyJwk: trustedPublicKey,
        status: 'active',
      },
    ],
    subjectPacket: {
      path: path.relative(repoRoot, subjectPacketPath),
    },
    sourceResolutions: [
      {
        sourceRef: SOURCE_REF,
        revision: SOURCE_REVISION,
        path: path.relative(repoRoot, sourceSchemaPath),
      },
    ],
    constructionArtifactResolutions: Object.entries(constructionRefs).map(([kind, artifactRef]) => ({
      kind,
      artifactRef,
      path: `schemas/experimental/packet-assembly-attestation/v0.1-draft/fixtures/construction/${kind}.json`,
    })),
    boundaryStatement: 'Synthetic fixture trust only. This context authenticates no production builder, source, approval, runtime admission, executor, or external effect.',
  };

  const unsigned = {
    recordKind: 'hacp.experimental.packet_assembly_attestation',
    schemaVersion: 'hacp-packet-assembly-attestation-0.1-draft',
    attestationId: 'assembly_attestation_fixture_001',
    builder: {
      principalId: TRUSTED_PRINCIPAL,
      authenticationMethod: AUTHENTICATION_METHOD,
      verificationProfileRef: TRUST_PROFILE_REF,
      keyId: TRUSTED_KEY_ID,
    },
    packetBinding: {
      packetId: subjectPacket.packetId,
      packetSchemaVersion: subjectPacket.schemaVersion,
      packetDigest: subjectPacket.digest,
    },
    sourceBindings: [
      {
        sourceRef: SOURCE_REF,
        revision: SOURCE_REVISION,
        digest: resolvedSourceDigest,
      },
    ],
    construction: {
      profile: declaredArtifact(constructionDescriptors.profile, constructionRefs.profile),
      tool: declaredArtifact(constructionDescriptors.tool, constructionRefs.tool),
      runtime: declaredArtifact(constructionDescriptors.runtime, constructionRefs.runtime),
    },
    constructedAt: '2026-09-08T07:00:00Z',
    declaredTransformations: [
      {
        transformationId: 'select-and-structure-bounded-request',
        description: 'Selected declared source material and structured it into the bounded task-packet fields.',
        inputRefs: [SOURCE_REF],
        outputRefs: [`packet-digest:${subjectPacket.digest.value}`],
      },
    ],
    limitations: [
      'Fixture authentication uses a public test key and establishes no production trust.',
      'The attestation does not prove source completeness, source authenticity, correct interpretation, or correct construction.',
      'ConstructedAt is a signed declaration, not a trusted timestamp.',
    ],
    boundaryStatement: BOUNDARY_STATEMENT,
  };

  const valid = finalizeAttestation(unsigned, trustedPrivateKey, TRUSTED_KEY_ID);

  const validForRepresentation = (representation, suffix) => {
    const variant = structuredClone(unsigned);
    variant.attestationId = `assembly_attestation_fixture_${suffix}`;
    variant.sourceBindings[0].digest = contentDigest(sourceBytes, representation);
    for (const [kind, descriptor] of Object.entries(constructionDescriptors)) {
      variant.construction[kind] = declaredArtifact(
        descriptor,
        constructionRefs[kind],
        representation,
      );
    }
    return finalizeAttestation(variant, trustedPrivateKey, TRUSTED_KEY_ID);
  };
  const validGitBlob = validForRepresentation('git-blob', 'git_blob');
  const validCanonicalJson = validForRepresentation('json-rfc8785-jcs', 'canonical_json');

  const sourceSubstitution = structuredClone(valid);
  sourceSubstitution.sourceBindings[0].revision = 'git:0000000000000000000000000000000000000000';
  const sourceSubstitutionSigned = finalizeAttestation(
    sourceSubstitution,
    trustedPrivateKey,
    TRUSTED_KEY_ID,
  );

  const packetMismatch = structuredClone(valid);
  packetMismatch.packetBinding.packetDigest.value = 'a'.repeat(64);
  const packetMismatchSigned = finalizeAttestation(packetMismatch, trustedPrivateKey, TRUSTED_KEY_ID);

  const selfAssertedIdentity = structuredClone(valid);
  selfAssertedIdentity.builder = {
    principalId: 'principal://example.invalid/self-asserted-builder',
    authenticationMethod: AUTHENTICATION_METHOD,
    verificationProfileRef: TRUST_PROFILE_REF,
    keyId: 'key://example.invalid/self-asserted-builder/untrusted-1',
  };
  const selfAssertedIdentitySigned = finalizeAttestation(
    selfAssertedIdentity,
    untrustedPrivateKey,
    selfAssertedIdentity.builder.keyId,
  );

  const signatureMismatch = structuredClone(valid);
  const firstCharacter = signatureMismatch.cryptographicBinding.signature[0];
  signatureMismatch.cryptographicBinding.signature = `${firstCharacter === 'A' ? 'B' : 'A'}${signatureMismatch.cryptographicBinding.signature.slice(1)}`;

  const changedClaim = structuredClone(valid);
  changedClaim.declaredTransformations[0].description = 'Undeclared post-signature construction change.';

  const constructionArtifactMismatch = structuredClone(valid);
  constructionArtifactMismatch.construction.tool.artifactDigest.value = 'b'.repeat(64);
  const constructionArtifactMismatchSigned = finalizeAttestation(
    constructionArtifactMismatch,
    trustedPrivateKey,
    TRUSTED_KEY_ID,
  );

  const files = new Map([
    ['construction/profile.json', constructionDescriptors.profile],
    ['construction/tool.json', constructionDescriptors.tool],
    ['construction/runtime.json', constructionDescriptors.runtime],
    ['verification-context.json', verificationContext],
    ['valid/packet-assembly-attestation.valid.json', valid],
    ['valid/packet-assembly-attestation.git-blob.valid.json', validGitBlob],
    ['valid/packet-assembly-attestation.json-rfc8785-jcs.valid.json', validCanonicalJson],
    ['invalid/source-revision-substitution.invalid.json', sourceSubstitutionSigned],
    ['invalid/packet-digest-mismatch.invalid.json', packetMismatchSigned],
    ['invalid/self-asserted-identity.invalid.json', selfAssertedIdentitySigned],
    ['invalid/signature-mismatch.invalid.json', signatureMismatch],
    ['invalid/changed-claim.invalid.json', changedClaim],
    ['invalid/construction-artifact-mismatch.invalid.json', constructionArtifactMismatchSigned],
  ]);

  const manifest = {
    schema: 'hacp.packet_assembly_attestation.conformance_manifest.v1',
    status: 'experimental_draft',
    sourceIssue: 'https://github.com/joefeser/hacp/issues/69',
    hacpEvidenceBase: '671791f3e7568a57b8e97bea5ac7f8c9e7e74b06',
    candidatePackageModified: false,
    verificationContext: 'verification-context.json',
    expectedValid: [
      {
        path: 'valid/packet-assembly-attestation.valid.json',
        expectedCodes: [],
      },
      {
        path: 'valid/packet-assembly-attestation.git-blob.valid.json',
        expectedCodes: [],
      },
      {
        path: 'valid/packet-assembly-attestation.json-rfc8785-jcs.valid.json',
        expectedCodes: [],
      },
    ],
    expectedInvalid: [
      {
        path: 'invalid/source-revision-substitution.invalid.json',
        expectedCodes: ['SOURCE_REVISION_MISMATCH'],
      },
      {
        path: 'invalid/packet-digest-mismatch.invalid.json',
        expectedCodes: ['PACKET_DIGEST_MISMATCH'],
      },
      {
        path: 'invalid/self-asserted-identity.invalid.json',
        expectedCodes: ['UNTRUSTED_BUILDER_PRINCIPAL'],
      },
      {
        path: 'invalid/signature-mismatch.invalid.json',
        expectedCodes: ['SIGNATURE_INVALID'],
      },
      {
        path: 'invalid/changed-claim.invalid.json',
        expectedCodes: ['CLAIM_DIGEST_MISMATCH'],
      },
      {
        path: 'invalid/construction-artifact-mismatch.invalid.json',
        expectedCodes: ['CONSTRUCTION_ARTIFACT_MISMATCH'],
      },
    ],
    boundaryStatement: 'Passing these fixtures proves bounded harness behavior only. It does not authenticate a production builder or prove correct packet construction.',
  };
  files.set('manifest.json', manifest);
  return { files, manifest, verificationContext };
}

function diagnostic(code, message) {
  return { code, message };
}

export async function validateAttestation(attestation, verificationContext, validateSchema) {
  if (!validateSchema(attestation)) {
    return [diagnostic(
      'SCHEMA_VALIDATION_FAILED',
      validateSchema.errors?.map((item) => `${item.instancePath || '/'} ${item.message}`).join('; ') || 'Schema validation failed.',
    )];
  }

  const expectedClaimDigest = digestClaim(attestation);
  if (!equalDigest(attestation.claimDigest, expectedClaimDigest)) {
    return [diagnostic('CLAIM_DIGEST_MISMATCH', 'Construction claim digest does not match its canonical preimage.')];
  }

  if (attestation.builder.keyId !== attestation.cryptographicBinding.keyId
    || attestation.builder.verificationProfileRef !== verificationContext.profileRef) {
    return [diagnostic('UNTRUSTED_BUILDER_PRINCIPAL', 'Attestation cannot select or change its own trust binding.')];
  }
  const trustedBuilder = verificationContext.trustedBuilders.find((entry) => (
    entry.status === 'active'
    && entry.principalId === attestation.builder.principalId
    && entry.authenticationMethod === attestation.builder.authenticationMethod
    && entry.keyId === attestation.builder.keyId
  ));
  if (!trustedBuilder) {
    return [diagnostic('UNTRUSTED_BUILDER_PRINCIPAL', 'No active verification-profile entry binds the declared principal, method, and key.')];
  }

  const signatureValid = verify(
    null,
    canonicalClaimInput(attestation),
    createPublicKey({ key: trustedBuilder.publicKeyJwk, format: 'jwk' }),
    Buffer.from(attestation.cryptographicBinding.signature, 'base64url'),
  );
  if (!signatureValid) {
    return [diagnostic('SIGNATURE_INVALID', 'Cryptographic binding does not verify under the admitted builder key.')];
  }

  const subjectPacket = await readJson(path.join(repoRoot, verificationContext.subjectPacket.path));
  if (!equalDigest(subjectPacket.digest, candidatePacketDigest(subjectPacket))) {
    return [diagnostic('PACKET_DIGEST_MISMATCH', 'Subject packet digest is not reproducible.')];
  }
  if (attestation.packetBinding.packetId !== subjectPacket.packetId
    || attestation.packetBinding.packetSchemaVersion !== subjectPacket.schemaVersion
    || !equalDigest(attestation.packetBinding.packetDigest, subjectPacket.digest)) {
    return [diagnostic('PACKET_DIGEST_MISMATCH', 'Attestation does not bind the exact packet under review.')];
  }

  for (const source of attestation.sourceBindings) {
    const resolution = verificationContext.sourceResolutions.find(
      (entry) => entry.sourceRef === source.sourceRef,
    );
    if (!resolution || resolution.revision !== source.revision) {
      return [diagnostic('SOURCE_REVISION_MISMATCH', 'Declared source revision does not match trusted resolution context.')];
    }
    let resolvedDigest;
    try {
      resolvedDigest = contentDigest(
        await readFile(path.join(repoRoot, resolution.path)),
        source.digest.representation,
      );
    } catch {
      return [diagnostic('SOURCE_DIGEST_MISMATCH', 'Resolved source content cannot be represented as declared.')];
    }
    if (source.digest.algorithm !== resolvedDigest.algorithm
      || source.digest.value !== resolvedDigest.value) {
      return [diagnostic('SOURCE_DIGEST_MISMATCH', 'Resolved source bytes do not match the declared source digest.')];
    }
  }

  for (const [kind, artifact] of Object.entries(attestation.construction)) {
    const resolution = verificationContext.constructionArtifactResolutions.find(
      (entry) => entry.kind === kind && entry.artifactRef === artifact.artifactRef,
    );
    if (!resolution) {
      return [diagnostic('CONSTRUCTION_ARTIFACT_MISMATCH', `No trusted resolution exists for the declared ${kind} artifact.`)];
    }
    const descriptorBytes = await readFile(path.join(repoRoot, resolution.path));
    let descriptor;
    let resolvedDigest;
    try {
      descriptor = JSON.parse(descriptorBytes);
      resolvedDigest = contentDigest(
        descriptorBytes,
        artifact.artifactDigest.representation,
      );
    } catch {
      return [diagnostic('CONSTRUCTION_ARTIFACT_MISMATCH', `Resolved ${kind} artifact cannot be represented as declared.`)];
    }
    if (descriptor.id !== artifact.id
      || descriptor.version !== artifact.version
      || artifact.artifactDigest.algorithm !== resolvedDigest.algorithm
      || artifact.artifactDigest.value !== resolvedDigest.value) {
      return [diagnostic('CONSTRUCTION_ARTIFACT_MISMATCH', `Declared ${kind} identity does not match resolved artifact bytes.`)];
    }
  }
  return [];
}

async function writeCorpus(corpus) {
  for (const [relativePath, value] of corpus.files) {
    const output = path.join(fixtureRoot, relativePath);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, stableJson(value));
  }
}

async function checkCorpus(corpus) {
  const validateSchema = await schemaValidator();
  const cases = [...corpus.manifest.expectedValid, ...corpus.manifest.expectedInvalid];
  for (const [relativePath, expected] of corpus.files) {
    const committed = await readFile(path.join(fixtureRoot, relativePath), 'utf8');
    if (committed !== stableJson(expected)) {
      throw new Error(`Committed fixture is stale: ${relativePath}`);
    }
  }
  for (const item of cases) {
    const record = await readJson(path.join(fixtureRoot, item.path));
    const actualCodes = (await validateAttestation(
      record,
      corpus.verificationContext,
      validateSchema,
    )).map((entry) => entry.code);
    if (JSON.stringify(actualCodes) !== JSON.stringify(item.expectedCodes)) {
      throw new Error(`${item.path}: expected ${item.expectedCodes.join(', ') || 'valid'}, got ${actualCodes.join(', ') || 'valid'}`);
    }
  }
  return {
    schema: 'hacp.packet_assembly_attestation.validation_result.v1',
    status: 'passed',
    expectedValid: corpus.manifest.expectedValid.length,
    expectedInvalid: corpus.manifest.expectedInvalid.length,
    candidatePackageModified: false,
  };
}

async function main() {
  const writeMode = process.argv.includes('--write');
  const checkMode = process.argv.includes('--check') || !writeMode;
  const corpus = await buildCorpus();
  if (writeMode) await writeCorpus(corpus);
  if (checkMode) process.stdout.write(`${stableJson(await checkCorpus(corpus))}`);
}

const isMain = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
