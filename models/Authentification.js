const mongoose = require("mongoose"); // J'importe mongoose pour pouvoir faire mongoose.model

const Authentification = mongoose.model("Authentification", {
  email: String,
  account: {
    username: String,
    avatar: Object, // nous verrons plus tard comment uploader une image
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});
// Export de mon model pour pouvoir l'utiliser ailleurs
module.exports = Authentification;
