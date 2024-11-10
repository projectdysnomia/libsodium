"use strict";

const test = require("node:test");
const assert = require("node:assert");

const KB_NULL = Buffer.alloc(1024); // known to be zeroed out
const KB_ONES = Buffer.alloc(1024, 1);

const EXPECTED_ABYTES = 16;
const EXPECTED_KEYBYTES = 32;
const EXPECTED_NPUBBYTES = 24;
const EXPECTED_NSECBYTES = 0;

test("native", async (/** @type {import("node:test").TestContext} */ ctx) => {
    /** @type {import("./native.js")} */
    const mod = require("./native.js");

    await ctx.test("is really native", () => {
        assert.strictEqual(mod.native, true, "module reports itself as non-native");
        assert.strictEqual(mod.wasm, false, "module reports itself as WASM");
    })

    await ctx.test("allocates 1024 null bytes", () => {
        const buf = mod.alloc(1024);
        assert(buf.buffer.equals(KB_NULL), "the buffer is not full of zeroes");
    });

    await ctx.test("transfers a buffer", () => {
        const buf = mod.transfer(KB_ONES);
        assert(buf.buffer.equals(KB_ONES), "the buffer is not full of ones");
    });

    await ctx.test("has correct constant values", () => {
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_ABYTES, EXPECTED_ABYTES, "ABYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_KEYBYTES, EXPECTED_KEYBYTES, "KEYBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, EXPECTED_NPUBBYTES, "NPUBBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NSECBYTES, EXPECTED_NSECBYTES, "NSECBYTES is incorrect");
    });
});


test("WASM", async (/** @type {import("node:test").TestContext} */ ctx) => {
    const mod = require("./wasm.js");

    await ctx.test("is really WASM", () => {
        assert.strictEqual(mod.wasm, true, "module reports itself as non-WASM");
        assert.strictEqual(mod.native, false, "module reports itself as native");
    })

    await ctx.test("allocates 1024 null bytes", ctx => {
        const buf = mod.alloc(1024);
        assert(buf.buffer.equals(KB_NULL), "the buffer is not full of zeroes");
        ctx.after(() => buf.free());
    });

    await ctx.test("transfers a buffer", ctx => {
        const buf = mod.transfer(KB_ONES);
        assert(buf.buffer.equals(KB_ONES), "the buffer is not full of ones");
        ctx.after(() => buf.free());
    });

    await ctx.test("has correct constant values", () => {
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_ABYTES, EXPECTED_ABYTES, "ABYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_KEYBYTES, EXPECTED_KEYBYTES, "KEYBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES, EXPECTED_NPUBBYTES, "NPUBBYTES is incorrect");
        assert.strictEqual(mod.crypto_aead_xchacha20poly1305_ietf_NSECBYTES, EXPECTED_NSECBYTES, "NSECBYTES is incorrect");
    });
});
