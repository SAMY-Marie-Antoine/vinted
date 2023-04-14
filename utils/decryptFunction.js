const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

const decryptFunction = (salt, password) => {
  return SHA256(salt + password).toString(encBase64);
};
module.exports = decryptFunction;
