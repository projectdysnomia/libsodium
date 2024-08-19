try {
    module.exports = require("./native.js");
} catch {
    module.exports = require("./wasm.js");
}
