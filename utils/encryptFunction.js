const uid2 = require("uid2"); // Package qui sert à créer des string aléatoires
const SHA256 = require("crypto-js/sha256"); // Sert à encripter une string
const encBase64 = require("crypto-js/enc-base64"); // Sert à transformer l'encryptage en string

const hashFunction = (password) => {
  const tab = [];
  // Générer un Salt
  const salt = uid2(16);
  tab[0] = salt;
  // Concaténer salt et password et encrypter le tout pour créer un hash
  const hash = SHA256(salt + password).toString(encBase64);
  tab[1] = hash;
  const token = uid2(64);
  tab[2] = token;
  return tab;
};
module.exports = hashFunction;
