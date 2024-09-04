const mod = require("./wasm/libsodium.js");

const {
    _malloc,
    _free,
    _sodium_init,
    // constants
    _crypto_aead_xchacha20poly1305_ietf_abytes,
    _crypto_aead_xchacha20poly1305_ietf_keybytes,
    _crypto_aead_xchacha20poly1305_ietf_messagebytes_max,
    _crypto_aead_xchacha20poly1305_ietf_npubbytes,
    _crypto_aead_xchacha20poly1305_ietf_nsecbytes,
    // functions
    _crypto_aead_xchacha20poly1305_ietf_decrypt,
    _crypto_aead_xchacha20poly1305_ietf_decrypt_detached,
    _crypto_aead_xchacha20poly1305_ietf_encrypt,
    _crypto_aead_xchacha20poly1305_ietf_encrypt_detached,
} = mod;

if (_sodium_init() < 0) {
    throw new Error("Initializing WASM-based libsodium failed");
}

class WASMBufferPointer {
    constructor(ptr, byteLength) {
        this._ptr = ptr;
        this._byteLength = byteLength;
        this._cachedBuffer = undefined;
    }

    get buffer() {
        // When the module's memory grows the _cachedBuffer is invalidated
        if (this._cachedBuffer?.buffer === mod.HEAPU8.buffer)
            return this._cachedBuffer;
        return this._cachedBuffer = Buffer.from(mod.HEAPU8.buffer, this._ptr, this._byteLength);
    }

    free() {
        _free(this._ptr);
    }

    subarray(start, end) {
        if (end === undefined) end = this._byteLength;
        if (start > end) throw new RangeError("start must be less than or equal to end");
        return new WASMBufferPointer(this._ptr + start, end - start);
    }
}

const _retValBuffer = new WASMBufferPointer(_malloc(4), 4); // used for storing return values of ull*

const checkedCall = (ret, functionName) => {
    if (ret !== 0) throw new Error(`call to ${functionName} failed`);
    return ret;
}

/**
 * @type {import("./index")}
 */
module.exports = {
    alloc(byteLength, zero = true) {
        const ptr = _malloc(byteLength);
        if (zero) mod.HEAPU8.fill(0, ptr, ptr + byteLength);

        return new WASMBufferPointer(ptr, byteLength);
    },

    transfer(buf) {
        const ptr = _malloc(buf.byteLength);
        mod.HEAPU8.set(buf, ptr);

        return new WASMBufferPointer(ptr, buf.byteLength);
    },

    crypto_aead_xchacha20poly1305_ietf_ABYTES: _crypto_aead_xchacha20poly1305_ietf_abytes(),
    crypto_aead_xchacha20poly1305_ietf_KEYBYTES: _crypto_aead_xchacha20poly1305_ietf_keybytes(),
    crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX: _crypto_aead_xchacha20poly1305_ietf_messagebytes_max() >>> 0, // this is unsigned
    crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: _crypto_aead_xchacha20poly1305_ietf_npubbytes(),
    crypto_aead_xchacha20poly1305_ietf_NSECBYTES: _crypto_aead_xchacha20poly1305_ietf_nsecbytes(),

    crypto_aead_xchacha20poly1305_ietf_decrypt(m, nsec, c, ad, npub, k) {
        checkedCall(
            _crypto_aead_xchacha20poly1305_ietf_decrypt(m._ptr, _retValBuffer._ptr, +nsec, c._ptr, c._byteLength, ad?._ptr ?? 0, ad?._byteLength ?? 0, npub._ptr, k._ptr),
            "crypto_aead_xchacha20poly1305_ietf_decrypt",
        );

        return _retValBuffer.buffer.readUInt32LE(0);
    },

    crypto_aead_xchacha20poly1305_ietf_decrypt_detached(m, nsec, c, mac, ad, npub, k) {
        return checkedCall(
            _crypto_aead_xchacha20poly1305_ietf_decrypt_detached(m._ptr, +nsec, c._ptr, c._byteLength, mac._ptr, ad?._ptr ?? 0, ad?._byteLength ?? 0, npub._ptr, k._ptr),
            "crypto_aead_xchacha20poly1305_ietf_decrypt_detached",
        )
    },

    crypto_aead_xchacha20poly1305_ietf_encrypt(c, m, ad, nsec, npub, k) {
        checkedCall(
            _crypto_aead_xchacha20poly1305_ietf_encrypt(c._ptr, _retValBuffer._ptr, m._ptr, m._byteLength, ad?._ptr ?? 0, ad?._byteLength ?? 0, +nsec, npub._ptr, k._ptr),
            "crypto_aead_xchacha20poly1305_ietf_encrypt",
        );

        return _retValBuffer.buffer.readUInt32LE(0);
    },

    crypto_aead_xchacha20poly1305_ietf_encrypt_detached(c, mac, m, ad, nsec, npub, k) {
        checkedCall(
            _crypto_aead_xchacha20poly1305_ietf_encrypt_detached(c._ptr, mac._ptr, _retValBuffer._ptr, m._ptr, m._byteLength, ad?._ptr ?? 0, ad?._byteLength ?? 0, +nsec, npub._ptr, k._ptr),
            "crypto_aead_xchacha20poly1305_ietf_encrypt_detached",
        );

        return _retValBuffer.buffer.readUInt32LE(0);
    },

    native: false,
    wasm: true,
};
