import type { Buffer } from "node:buffer";

declare namespace LibSodium {
    /**
     * Represents a buffer for interfacing with the methods of this library.
     *
     * It is safe to store references to these objects in your code.
     */
    interface BufferPointer {
        /**
         * A view into the buffer. Accessing this property is always
         * guaranteed to return a valid view into the buffer.
         *
         * It is not recommended to store the returned buffer, as on
         * WASM the memory allocation may grow, invalidating the 
         * returned buffer.
         */
        buffer: Buffer;
        /**
         * Releases the memory of the buffer.
         */
        free(): void;
        /**
         * Returns a buffer pointer to a portion of the backing buffer.
         * @param start The start index of the subarray
         * @param end The end index of the subarray
         */
        subarray(start: number, end: number): BufferPointer;
    }

    /**
     * Allocates a new buffer of the specified length in the appropriate backend.
     * @param byteLength The amount of bytes to allocate
     * @param zero Whether to zero out the allocated memory. Defaults to `true`
     */
    export function alloc(byteLength: number, zero?: boolean): BufferPointer;

    /**
     * Transfers the buffer over to the appropriate backend.
     * 
     * On the native backend, the buffer is wrapped in a {@link BufferPointer}.
     * On WASM, the buffer is copied into the WASM memory and a {@link BufferPointer}
     * is returned to the copied memory.
     * @param buffer The buffer to transfer
     */
    export function transfer(buffer: Buffer): BufferPointer;

    /**
     * The byte length of the MAC code.
     */
    export const crypto_aead_xchacha20poly1305_ietf_ABYTES: number;
    /**
     * The byte length of the encryption key.
     */
    export const crypto_aead_xchacha20poly1305_ietf_KEYBYTES: number;
    /**
     * The maximum byte length of the message to encrypt/decrypt.
     */
    export const crypto_aead_xchacha20poly1305_ietf_MESSAGEBYTES_MAX: number;
    /**
     * The byte length of the public nonce.
     */
    export const crypto_aead_xchacha20poly1305_ietf_NPUBBYTES: number;
    /**
     * The byte length of the secret nonce. Always 0.
     */
    export const crypto_aead_xchacha20poly1305_ietf_NSECBYTES: 0;

    /**
     * Decrypts a message in combined mode.
     * @param m Pointer to the decrypted message memory
     * @param nsec Unused, must be null
     * @param c The ciphertext to decrypt
     * @param ad Additional data
     * @param npub The public nonce
     * @param k The decryption key
     */
    export function crypto_aead_xchacha20poly1305_ietf_decrypt(m: BufferPointer, nsec: null, c: BufferPointer, ad: BufferPointer | null, npub: BufferPointer, k: BufferPointer): number;
    /**
     * Decrypts a message in detached mode.
     * @param m Pointer to the decrypted message memory
     * @param nsec Unused, must be null
     * @param c Pointer to the ciphertext to decrypt
     * @param mac Pointer to the message authentication code
     * @param ad Pointer to additional data
     * @param npub Pointer to the public nonce
     * @param k Pointer to the decryption key
     */
    export function crypto_aead_xchacha20poly1305_ietf_decrypt_detached(m: BufferPointer, nsec: null, c: BufferPointer, mac: BufferPointer, ad: BufferPointer | null, npub: BufferPointer, k: BufferPointer): number;
    /**
     * Encrypts a message in combined mode.
     * @param c Pointer to the resulting ciphertext
     * @param m Pointer to the message to encrypt
     * @param ad Pointer to additional data
     * @param nsec Unused, must be null
     * @param npub Pointer to the public nonce
     * @param k Pointer to the encryption key
     */
    export function crypto_aead_xchacha20poly1305_ietf_encrypt(c: BufferPointer, m: BufferPointer, ad: BufferPointer | null, nsec: null, npub: BufferPointer, k: BufferPointer): number;
    /**
     * Encrypts a message in detached mode.
     * @param c Pointer to the resulting ciphertext
     * @param mac Pointer to the resulting message authentication code
     * @param m Pointer to the message to encrypt
     * @param ad Pointer to additional data
     * @param nsec Unused, must be null
     * @param npub Pointer to the public nonce
     * @param k Pointer to the encryption key
     */
    export function crypto_aead_xchacha20poly1305_ietf_encrypt_detached(c: BufferPointer, mac: BufferPointer, m: BufferPointer, ad: BufferPointer | null, nsec: null, npub: BufferPointer, k: BufferPointer): number;
    /**
     * Whether the native backend is loaded or not
     */
    export const native: boolean;
    /**
     * Whether the WASM backend is loaded or not
     */
    export const wasm: boolean;
}

export = LibSodium;
