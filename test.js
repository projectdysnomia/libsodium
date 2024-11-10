"use strict";

const test = require("node:test");
const assert = require("node:assert");

const KB_NULL = Buffer.alloc(1024); // known to be zeroed out
const KB_ONES = Buffer.alloc(1024, 1);

const fromHex = (hex) => Buffer.from(hex.replaceAll(" ", ""), "hex");

const SAMPLE_DATA = Buffer.from("testing sample data");

// pre-encrypted SAMPLE_DATA with a zero-filled key and nonce and an auth tag derived from 32 null bytes
const ENCRYPTED_SAMPLE_DATA = fromHex("0c fb e5 fd 8c 4e ea 5f aa 80 9e b5 d9 51 3f 2c 8e 6c c0");
const ENCRYPTED_SAMPLE_DATA_AD = fromHex("da aa 19 b2 77 9a ca 0a 40 97 50 a4 dc 25 7f d3");
const ENCRYPTED_SAMPLE_DATA_COMBINED = Buffer.concat([ENCRYPTED_SAMPLE_DATA, ENCRYPTED_SAMPLE_DATA_AD]);

const EXPECTED_ABYTES = 16;
const EXPECTED_KEYBYTES = 32;
const EXPECTED_NPUBBYTES = 24;
const EXPECTED_NSECBYTES = 0;

const SAMPLE_AUTH_TAG_LENGTH = 32;

/**
 * @param {import("node:test").TestContext} ctx 
 * @param {import(".")} mod 
 */
async function testMod(ctx, mod) {
    await ctx.test("allocates 1024 null bytes", () => {
        const buf = mod.alloc(1024);
        assert.strict(buf.buffer.equals(KB_NULL), "the buffer is not full of zeroes");
    });

    await ctx.test("transfers a buffer", () => {
        const buf = mod.transfer(KB_ONES);
        assert.strict(buf.buffer.equals(KB_ONES), "the buffer is not full of ones");
    });

    await ctx.test("can make a subarray", () => {
        const buf = mod.transfer(KB_ONES);
        const sub = buf.subarray(0, 512);
        assert.strictEqual(sub.buffer.byteLength, 512, "the subarray has incorrect length");
        assert.strict(sub.buffer.equals(KB_ONES.subarray(0, 512)), "the subarray has incorrect contents");
    });

    await ctx.test("has correct constant values", () => {
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_ABYTES, EXPECTED_ABYTES, "ABYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_KEYBYTES, EXPECTED_KEYBYTES, "KEYBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, EXPECTED_NPUBBYTES, "NPUBBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NSECBYTES, EXPECTED_NSECBYTES, "NSECBYTES is incorrect");
    });

    await ctx.test("encrypts a buffer in combined mode", () => {
        const buf = mod.alloc(SAMPLE_DATA.byteLength + EXPECTED_ABYTES);
        const cleartextBuf = mod.transfer(SAMPLE_DATA);
        const ad = mod.alloc(SAMPLE_AUTH_TAG_LENGTH);
        const npub = mod.alloc(EXPECTED_NPUBBYTES);
        const k = mod.alloc(EXPECTED_KEYBYTES);

        ctx.after(() => {
            buf.free();
            cleartextBuf.free();
            ad.free();
            npub.free();
            k.free();
        });

        const v = mod.crypto_aead_xchacha20poly1305_ietf_encrypt(buf, cleartextBuf, ad, null, npub, k);

        assert.strictEqual(v, buf.buffer.byteLength, "the return value is incorrect");
        assert.strict(buf.buffer.equals(ENCRYPTED_SAMPLE_DATA_COMBINED), "the encrypted data is incorrect");
    });

    await ctx.test("decrypts a buffer in combined mode", () => {
        const cleartextBuf = mod.alloc(ENCRYPTED_SAMPLE_DATA_COMBINED.byteLength - EXPECTED_ABYTES);
        const buf = mod.transfer(ENCRYPTED_SAMPLE_DATA_COMBINED);
        const ad = mod.alloc(SAMPLE_AUTH_TAG_LENGTH);
        const npub = mod.alloc(EXPECTED_NPUBBYTES);
        const k = mod.alloc(EXPECTED_KEYBYTES);

        ctx.after(() => {
            cleartextBuf.free();
            buf.free();
            ad.free();
            npub.free();
            k.free();
        })

        const v = mod.crypto_aead_xchacha20poly1305_ietf_decrypt(cleartextBuf, null, buf, ad, npub, k);

        assert.strictEqual(v, cleartextBuf.buffer.byteLength, "the return value is incorrect");
        assert.strict(cleartextBuf.buffer.equals(SAMPLE_DATA), "the decrypted data is incorrect");
    });

    await ctx.test("encrypts a buffer in detached mode", () => {
        const buf = mod.alloc(SAMPLE_DATA.byteLength);
        const mac = mod.alloc(EXPECTED_ABYTES);
        const cleartextBuf = mod.transfer(SAMPLE_DATA);
        const ad = mod.alloc(SAMPLE_AUTH_TAG_LENGTH);
        const npub = mod.alloc(EXPECTED_NPUBBYTES);
        const k = mod.alloc(EXPECTED_KEYBYTES);

        ctx.after(() => {
            buf.free();
            mac.free();
            cleartextBuf.free();
            ad.free();
            npub.free();
            k.free();
        });

        const v = mod.crypto_aead_xchacha20poly1305_ietf_encrypt_detached(buf, mac, cleartextBuf, ad, null, npub, k);

        assert.strictEqual(v, mac.buffer.byteLength, "the return value is incorrect");
        assert.strict(buf.buffer.equals(ENCRYPTED_SAMPLE_DATA), "the encrypted data is incorrect");
    });

    await ctx.test("decrypts a buffer in detached mode", () => {
        const cleartextBuf = mod.alloc(SAMPLE_DATA.byteLength);
        const buf = mod.transfer(ENCRYPTED_SAMPLE_DATA);
        const mac = mod.transfer(ENCRYPTED_SAMPLE_DATA_AD);
        const ad = mod.alloc(SAMPLE_AUTH_TAG_LENGTH);
        const npub = mod.alloc(EXPECTED_NPUBBYTES);
        const k = mod.alloc(EXPECTED_KEYBYTES);

        ctx.after(() => {
            buf.free();
            npub.free();
            k.free();
            ad.free();
            cleartextBuf.free();
            mac.free();
        });

        mod.crypto_aead_xchacha20poly1305_ietf_decrypt_detached(cleartextBuf, null, buf, mac, ad, npub, k);

        assert.strict(cleartextBuf.buffer.equals(SAMPLE_DATA), "the decrypted data is incorrect");
    });
}


test("native", async (/** @type {import("node:test").TestContext} */ ctx) => {
    /** @type {import("./native.js")} */
    const mod = require("./native.js");

    await ctx.test("is really native", () => {
        assert.strictEqual(mod.native, true, "module reports itself as non-native");
        assert.strictEqual(mod.wasm, false, "module reports itself as WASM");
    });

    await testMod(ctx, mod);
});


test("WASM", async (/** @type {import("node:test").TestContext} */ ctx) => {
    const mod = require("./wasm.js");

    await ctx.test("is really WASM", () => {
        assert.strictEqual(mod.wasm, true, "module reports itself as non-WASM");
        assert.strictEqual(mod.native, false, "module reports itself as native");
    });

    await testMod(ctx, mod);

    await ctx.test("buffer pointers work even after the WASM memory is invalidated", () => {
        const ptr = mod.transfer(KB_ONES);
        const buf = ptr.buffer;
        ctx.after(() => ptr.free());

        const anotherPtr = mod.alloc(1024); // the initial WASM memory is 4 MB, so no references should be invalidated
        ctx.after(() => anotherPtr.free());

        assert.strictEqual(buf, ptr.buffer, "the buffer cache doesn't work");

        // twice the size of initial WASM memory, keep in sync with scripts/build-libsodium.sh if changed
        const reallyLargePtr = mod.alloc(8 * (1024 ** 2)); 
        ctx.after(() => reallyLargePtr.free());

        assert.notStrictEqual(buf, ptr.buffer, "the original buffer is still valid after a really large allocation");
        assert.strict(ptr.buffer.equals(KB_ONES), "the buffer is not full of ones");
    });
});
