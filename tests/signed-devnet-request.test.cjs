const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
// Compile the actual TypeScript helpers without adding a test-runner dependency.
require.extensions['.ts'] = (module, filename) => {
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  module._compile(code, filename);
};
const { Keypair, SystemProgram, Transaction, TransactionInstruction } = require('@solana/web3.js');
const { readTransactionRequest, assertInstruction } = require('../lib/signed-devnet-request.ts');
const { sendDevnetTransaction } = require('../lib/send-devnet-transaction.ts');
const idl = require('../lib/idl/memedictions_v2_devnet.json');
const { PublicKey } = require('@solana/web3.js');
const payer = Keypair.generate();
const blockhash = Keypair.generate().publicKey.toBase58();
const definition = idl.instructions.find(ix => ix.name === 'submit_prediction');
const policy = { program: idl.address, discriminator: definition.discriminator };
function signed(instructions, signers = [payer]) {
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash });
  tx.add(...instructions); tx.sign(...signers);
  return { transaction: tx.serialize().toString('base64'), blockhash, lastValidBlockHeight: 123 };
}
function memedictions(ix = definition) {
  return new TransactionInstruction({ programId: new PublicKey(idl.address),
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from(ix.discriminator) });
}
const valid = signed([memedictions()]);
function request(body = valid, headers = {}, url = 'https://demo.example/api/test/prediction/send') {
  return new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body) });
}
test('accepts signed legacy transactions for all three manual instructions', async () => {
  for (const ix of idl.instructions) {
    const parsed = await readTransactionRequest(request(signed([memedictions(ix)])));
    assertInstruction(parsed.transaction, idl.address, ix.discriminator);
  }
});
test('rejects transfer, wrong operation and extra instruction on a manual endpoint', async () => {
  const transfer = SystemProgram.transfer({ fromPubkey: payer.publicKey,
    toPubkey: Keypair.generate().publicKey, lamports: 1 });
  for (const instructions of [[transfer], [memedictions(idl.instructions[0])], [memedictions(), transfer]]) {
    const parsed = await readTransactionRequest(request(signed(instructions)));
    assert.throws(() => assertInstruction(parsed.transaction, policy.program, policy.discriminator));
  }
});
test('rejects forged/missing signatures, changed blockhash and invalid expiry', async () => {
  const raw = Buffer.from(valid.transaction, 'base64'); raw[1] ^= 1;
  const unsigned = new Transaction({ feePayer: payer.publicKey, recentBlockhash: blockhash }).add(memedictions());
  for (const body of [
    { ...valid, transaction: raw.toString('base64') },
    { ...valid, transaction: unsigned.serialize({ requireAllSignatures: false }).toString('base64') },
    { ...valid, blockhash: Keypair.generate().publicKey.toBase58() },
    { ...valid, lastValidBlockHeight: -1 }, { ...valid, lastValidBlockHeight: 1.5 },
    { ...valid, transaction: valid.transaction + '\n' },
    { ...valid, transaction: Buffer.alloc(1233).toString('base64') },
  ]) await assert.rejects(readTransactionRequest(request(body)));
});
test('rejects malformed JSON, null and arrays with a controlled client error', async () => {
  for (const body of ['{', 'null', '[]']) {
    const response = await sendDevnetTransaction(request(body), () => { throw new Error('must not reach RPC'); }, policy);
    assert.equal(response.status, 400);
  }
});
test('rejects cross-site browser requests but accepts same-origin requests', async () => {
  for (const headers of [{ origin: 'https://evil.example' }, { 'sec-fetch-site': 'cross-site' }]) {
    await assert.rejects(readTransactionRequest(request(valid, headers)), e => e.status === 403);
  }
  await readTransactionRequest(request(valid, { origin: 'https://demo.example' }));
  await assert.rejects(readTransactionRequest(request(valid, { 'Content-Type': 'text/plain' })), e => e.status === 415);
});
test('enforces streamed body size even with a misleading Content-Length', async () => {
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(Buffer.alloc(3000, 32)); controller.enqueue(Buffer.alloc(2000, 32)); controller.close();
  }});
  const req = new Request('https://demo.example/api/pyth/send', { method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': '1' }, body: stream, duplex: 'half' });
  await assert.rejects(readTransactionRequest(req), e => e.status === 413);
});
test('preserves multisigner Pyth-style legacy batches and verifies every signer', async () => {
  const temporary = Keypair.generate();
  const create = SystemProgram.createAccount({ fromPubkey: payer.publicKey, newAccountPubkey: temporary.publicKey,
    lamports: 1, space: 8, programId: new PublicKey(idl.address) });
  const body = signed([create, memedictions()], [payer, temporary]);
  const parsed = await readTransactionRequest(request(body));
  assert.equal(parsed.transaction.signatures.length, 2);
  const raw = Buffer.from(body.transaction, 'base64'); raw[65] ^= 1;
  await assert.rejects(readTransactionRequest(request({ ...body, transaction: raw.toString('base64') })));
});
test('validation happens before RPC; provider errors never expose credentials', async () => {
  let calls = 0;
  const response = await sendDevnetTransaction(request(signed([SystemProgram.transfer({
    fromPubkey: payer.publicKey, toPubkey: Keypair.generate().publicKey, lamports: 1 })])),
    () => { calls++; }, policy);
  assert.equal(response.status, 400); assert.equal(calls, 0);
  const failed = await sendDevnetTransaction(request(), () => ({
    sendRawTransaction: async () => { throw new Error('https://rpc.example/?api-key=SECRET'); }
  }), policy);
  assert.equal(failed.status, 409); assert.ok(!JSON.stringify(await failed.json()).includes('SECRET'));
});
test('retains signature on uncertain confirmation and recovers confirmed status', async () => {
  for (const recovered of [false, true]) {
    const response = await sendDevnetTransaction(request(), () => ({
      sendRawTransaction: async () => 'known-signature',
      confirmTransaction: async () => { throw new Error('timeout'); },
      getSignatureStatuses: async () => ({ value: [recovered ? { err: null, confirmationStatus: 'confirmed' } : null] })
    }), policy);
    assert.equal(response.status, recovered ? 200 : 409);
    const body = await response.json(); assert.equal(body.signature, 'known-signature');
    assert.equal(body.ok, recovered);
  }
});
test('Pyth prediction succeeds on its relay and is rejected on the manual relay', async () => {
  const pythIdl = require('../lib/idl/memedictions_v2_2_pyth.json');
  const ix = pythIdl.instructions.find(ix => ix.name === 'submit_prediction');
  const body = signed([new TransactionInstruction({ programId: new PublicKey(pythIdl.address),
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    data: Buffer.from(ix.discriminator) })]);
  let calls = 0;
  const rpc = () => ({ sendRawTransaction: async () => { calls++; return 'pyth-signature'; },
    confirmTransaction: async () => ({ value: { err: null } }) });
  const wrongRoute = await sendDevnetTransaction(request(body), rpc, policy);
  assert.equal(wrongRoute.status, 400); assert.equal(calls, 0);
  const correctRoute = await sendDevnetTransaction(request(body), rpc);
  assert.equal(correctRoute.status, 200); assert.equal(calls, 1);
  assert.equal((await correctRoute.json()).signature, 'pyth-signature');
});
