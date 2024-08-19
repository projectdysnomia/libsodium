const {
    // constants
    crypto_aead_xchacha20poly1305_ietf_ABYTES,
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX,
    crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    crypto_aead_xchacha20poly1305_ietf_NSECBYTES,

    // functions
    crypto_aead_xchacha20poly1305_ietf_decrypt,
    crypto_aead_xchacha20poly1305_ietf_decrypt_detached,
    crypto_aead_xchacha20poly1305_ietf_encrypt,
    crypto_aead_xchacha20poly1305_ietf_encrypt_detached,
} = require("sodium-native");

class NativeBufferPointer {
    constructor(buf) {
        this.buffer = buf;
    }

    free() {
        // no-op - the buffer will be reclaimed by the GC
    }

    subarray(start, end) {
        if (start > end) throw new RangeError("start must be less than or equal to end");
        return new NativeBufferPointer(this.buffer.subarray(start, end));
    }
}

/**
 * @type {import("./index")}
 */
module.exports = {
    alloc(byteLength, zero = true) {
        return new NativeBufferPointer(zero ? Buffer.alloc(byteLength) : Buffer.allocUnsafe(byteLength));
    },

    transfer(buf) {
        return new NativeBufferPointer(buf);
    },

    crypto_aead_xchacha20poly1305_ietf_ABYTES,
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES,
    crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX,
    crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    crypto_aead_xchacha20poly1305_ietf_NSECBYTES,

    crypto_aead_xchacha20poly1305_ietf_decrypt(m, nsec, c, ad, npub, k) {
        return crypto_aead_xchacha20poly1305_ietf_decrypt(m.buffer, nsec, c.buffer, ad?.buffer ?? null, npub.buffer, k.buffer);
    },

    crypto_aead_xchacha20poly1305_ietf_decrypt_detached(m, nsec, c, mac, ad, npub, k) {
        return crypto_aead_xchacha20poly1305_ietf_decrypt_detached(m.buffer, nsec, c.buffer, mac.buffer, ad?.buffer ?? null, npub.buffer, k.buffer);
    },

    crypto_aead_xchacha20poly1305_ietf_encrypt(c, m, ad, nsec, npub, k) {
        return crypto_aead_xchacha20poly1305_ietf_encrypt(c.buffer, m.buffer, ad?.buffer ?? null, nsec, npub.buffer, k.buffer);
    },

    crypto_aead_xchacha20poly1305_ietf_encrypt_detached(c, mac, m, ad, nsec, npub, k) {
        return crypto_aead_xchacha20poly1305_ietf_encrypt_detached(c.buffer, mac.buffer, m.buffer, ad?.buffer ?? null, nsec, npub.buffer, k.buffer);
    },

    native: true,
    wasm: false,
};
