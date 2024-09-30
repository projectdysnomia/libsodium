#! /bin/sh
# Taken from https://github.com/jedisct1/libsodium/blob/b7b1c08272dc3b8548b189cf558ee8bda63f3491/dist-build/emscripten.sh and heavily stripped down.
cd libsodium
export MAKE_FLAGS='-j4'
export EXPORTED_FUNCTIONS_STANDARD='["_malloc","_free","_crypto_aead_xchacha20poly1305_ietf_abytes","_crypto_aead_xchacha20poly1305_ietf_decrypt","_crypto_aead_xchacha20poly1305_ietf_decrypt_detached","_crypto_aead_xchacha20poly1305_ietf_encrypt","_crypto_aead_xchacha20poly1305_ietf_encrypt_detached","_crypto_aead_xchacha20poly1305_ietf_keybytes","_crypto_aead_xchacha20poly1305_ietf_messagebytes_max","_crypto_aead_xchacha20poly1305_ietf_npubbytes","_crypto_aead_xchacha20poly1305_ietf_nsecbytes","_sodium_init"]'
export EXPORTED_RUNTIME_METHODS='[]'
export JS_RESERVED_MEMORY_STANDARD=16MB
export JS_RESERVED_MEMORY_SUMO=48MB
export JS_RESERVED_MEMORY_TESTS=16MB
export WASM_INITIAL_MEMORY=4MB
export LDFLAGS="-s RESERVED_FUNCTION_POINTERS=8"
export LDFLAGS="${LDFLAGS} -s ALLOW_MEMORY_GROWTH=1"
export LDFLAGS="${LDFLAGS} -s ASSERTIONS=0"
export LDFLAGS="${LDFLAGS} -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s ALIASING_FUNCTION_POINTERS=1"
export LDFLAGS="${LDFLAGS} -s DISABLE_EXCEPTION_CATCHING=1"
export LDFLAGS="${LDFLAGS} -s ELIMINATE_DUPLICATE_FUNCTIONS=1"
export LDFLAGS="${LDFLAGS} -s NODEJS_CATCH_EXIT=0"
export LDFLAGS="${LDFLAGS} -s NODEJS_CATCH_REJECTION=0"
export LDFLAGS="${LDFLAGS} -s WASM_ASYNC_COMPILATION=0"

echo

export EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS_STANDARD"
export LDFLAGS="${LDFLAGS} ${LDFLAGS_DIST}"
export LDFLAGS_JS="-s TOTAL_MEMORY=${JS_RESERVED_MEMORY_STANDARD}"
export PREFIX="$(pwd)/libsodium-js"
export DONE_FILE="$(pwd)/js.done"
export CONFIG_EXTRA="--enable-minimal"
export DIST='yes'
echo "Building a standard distribution in [${PREFIX}]"
export JS_EXPORTS_FLAGS="-s EXPORTED_FUNCTIONS=${EXPORTED_FUNCTIONS} -s EXPORTED_RUNTIME_METHODS=${EXPORTED_RUNTIME_METHODS}"

rm -f "$DONE_FILE"

echo

emconfigure ./configure $CONFIG_EXTRA --disable-shared --prefix="$PREFIX" \
  --without-pthreads \
  --disable-ssp --disable-asm --disable-pie &&
  emmake make clean
[ $? = 0 ] || exit 1

emccLibsodium() {
outFile="${1}"
shift
emcc "$CFLAGS" --llvm-lto 1 $CPPFLAGS $LDFLAGS $JS_EXPORTS_FLAGS "${@}" \
    "${PREFIX}/lib/libsodium.a" -o "${outFile}" || exit 1
}
emmake make $MAKE_FLAGS install || exit 1
emccLibsodium "${PREFIX}/lib/libsodium.js" -O3 -s WASM=1 -s EVAL_CTORS=1 -s INITIAL_MEMORY=${WASM_INITIAL_MEMORY}

touch -r "${PREFIX}/lib/libsodium.js" "$DONE_FILE"
ls -l "${PREFIX}/lib/libsodium.js" "${PREFIX}/lib/libsodium.wasm"
cd ..

WASM_DIR="$(pwd)/wasm"
mkdir -p "$WASM_DIR"
cp -f "$PREFIX/lib/libsodium.js" "$PREFIX/lib/libsodium.wasm" "$WASM_DIR"
cp -f "libsodium/LICENSE" "$WASM_DIR/LICENSE.libsodium"

exit 0
