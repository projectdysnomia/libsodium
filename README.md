# @projectdysnomia/libsodium
A minimal unified interface for libsodium-based XChaCha20 Poly1305 encryption/decryption.

This is achieved by using the following libraries:
- [`sodium-native`](https://www.npmjs.com/package/sodium-native) uses a native build of libsodium and is preferred when available.
- A heavily stripped down custom build of [libsodium.js](https://www.npmjs.com/package/libsodium) is used as a fallback.
  The differences between libsodium.js and this package are as follows:
    - The WASM binary initiates synchronously, making it better suited for CommonJS environments
    - Only the WASM binary is provided, there is no fallback to JS-based emulation
    - Only `crypto_aead_xchacha20poly1305_ietf_*` (sans `crypto_aead_xchacha20poly1305_ietf_keygen`) and `sodium_init` methods are exposed in the WASM binary

## Installation
Note that
```sh
# install with the WASM backend bundled by default
npm install @projectdysnomia/libsodium
# optionally, you may also install sodium-native for better performance
npm install sodium-native
```

## Usage
```js
// auto-selected backend: native is preferred
const mod = require("@projectdysnomia/libsodium");
// native-only
const mod = require("@projectdysnomia/libsodium/native");
// WASM-only
const mod = require("@projectdysnomia/libsodium/wasm");

```
