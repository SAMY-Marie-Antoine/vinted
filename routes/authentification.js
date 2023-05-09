const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router();
const hashFunction = require("../utils/encryptFunction");
const decryptFunction = require("../utils/decryptFunction");
const isAuthenticated = require("../middlewares/isAuthenticated");

const Authentification = require("../models/Authentification");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
//app.use(fileUpload());

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/upload", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    //console.log("je suis de retour apres isAuth\n");
    //console.log(req.body, "\n");
    //console.log(req.files);
    //console.log(req.user, "\n");

    const pictureToUpload = req.files.picture;
    const result = await cloudinary.uploader.upload(
      convertToBase64(pictureToUpload)
      //{ folder: "/vinted/offers/" }
    );
    console.log(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

router.post("/user/signup", async (req, res) => {
  try {
    const { email, username, password, newsletter } = req.body;
    console.log(req.body);
    const user = await Authentification.findOne({ email: email });
    if (!username) {
      return res.status(500).json({ message: "username vide !!!" });
    }
    if (user) {
      return res
        .status(500)
        .json({ message: "email exite déjà dans la base !!!" });
    }
    const result = hashFunction(password);
    console.log("resultat :", result[0], result[1], result[2]);
    const newAuthentification = new Authentification({
      email: email,
      account: { username: username, avatar: "" },
      newsletter: newsletter,
      salt: result[0],
      hash: result[1],
      token: result[2],
    });

    //console.log(newAuthentification);
    await newAuthentification.save();
    res.status(201).json({
      _id: newAuthentification._id,
      token: newAuthentification.token,
      account: newAuthentification.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Je regarde si user est dans la base
    const user = await Authentification.find({ email: req.body.email });
    //console.log(user);
    if (!user[0]) {
      return res.status(500).json({ message: "vérifier email !" });
    }

    const hash = decryptFunction(user[0].salt, password);

    if (user[0].email !== email) {
      return res.status(500).json({ message: "Unauthorized !" });
    }

    if (hash !== user[0].hash) {
      return res.status(500).json({ message: "Unauthorized!!" });
    } else {
      res.status(201).json({
        message: `${user[0].email} is successfull connected`,
        _id: user._id,
        account: user.account,
        token: user.token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
