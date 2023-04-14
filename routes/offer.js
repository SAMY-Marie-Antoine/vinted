const express = require("express");
const app = express();
app.use(express.json());
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

const fileUpload = require("express-fileupload");
const Offer = require("../models/Offer");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      console.log("je suis de retour apres isAuth\n");
      //console.log(req.body");
      //console.log(req.files);
      //console.log(req.user);
      const userId = req.user.id;
      // console.log(userId);
      const pictureToUpload = req.files.picture;
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
        //{ folder: "/vinted/offers/" }
      );
      //console.log(result);

      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        product_image: result, //{ secure_url: result.secure_url },
        owner: userId,
      });
      await newOffer.save();

      // console.log("newOffer", newOffer);

      res.status(201).json({ newOffer });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
);

router.put(
  "/offer/update/:id",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      console.log("je suis de retour apres isAuth\n");
      //console.log(req.body");
      //console.log(req.files);
      //console.log(req.user);
      const userId = req.user.id;
      const paramsId = req.params.id;
      // console.log(paramsId);
      const pictureToUpload = req.files.picture;
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload),
        { folder: "/vinted/offers/" }
      );
      //console.log(result);

      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const offerToUpdate = await Offer.findById(paramsId, { new: true }); // FindById renvoie toujours un objet

      (offerToUpdate.product_name = title),
        (offerToUpdate.product_description = description),
        (offerToUpdate.product_price = price),
        (offerToUpdate.product_details = [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ]),
        (offerToUpdate.owner = userId),
        (offerToUpdate.product_image = result),
        await offerToUpdate.save();

      console.log("offerToUpdate", offerToUpdate);

      res.status(201).json({ offerToUpdate });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error });
    }
  }
);

router.delete("/offer/delete/:id", async (req, res) => {
  try {
    const paramsId = req.params.id;

    // Je peux utiliser findByIdAndDelete pour tout faire d'un coup
    await Offer.findByIdAndDelete(paramsId);
    res.json({ message: `Offer ${paramsId}  deleted !` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    //let sort = "";
    console.log(req.query);

    const { title, priceMin, priceMax, sort, page } = req.query;

    const filter = {};
    // console.log(filter);

    if (title) {
      filter.product_name = new RegExp(title, "i");
    }
    // console.log(filter);
    if (priceMin) {
      console.log("J'ai reçu un price min ");
      filter.product_price = { $gte: Number(priceMin) };
    }
    // console.log(filter);

    if (priceMax) {
      // console.log("J'ai reçu un priceMax");
      if (filter.product_price) {
        // console.log(
        //   "la clef product_price existe déjà, donc je l'ai déjà crée donc j'ai aussi reçu un price min"
        // );
        filter.product_price.$lte = Number(priceMax);
      } else {
        // console.log(
        //   "la clef product_price n'existe pas donc je ne l'ai pas déjà créée donc je n'ai pas reçu de price min"
        // );
        filter.product_price = { $lte: Number(priceMax) };
      }
    }

    const sortFilter = {};

    if (sort === "price-desc") {
      sortFilter.product_price = -1;
    } else if (sort === "price-asc") {
      sortFilter.product_price = 1;
    }

    const limit = 3;

    // 5 résultats par page : 1 skip=0  2 skip=5 3 skip=10
    // 3 résultats par page : 1 skip=0  2 skip=3 3 skip=6 4 : skip=9

    // skip  = nombre de résultats par page * (num de page -1)

    let pageRequired = 1;
    if (page) {
      pageRequired = page;
    }

    const skip = (pageRequired - 1) * limit;
    console.log(skip);

    console.log(filter);
    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filter);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//8)  http://localhost:3000/offer/5f902e340bc98d4f6e4e94aa

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.query);
    const paramsId = req.params.id;
    console.log(paramsId);
    const offers = await Offer.findById(paramsId)
      .sort("asc")
      .populate("owner", "account");

    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
