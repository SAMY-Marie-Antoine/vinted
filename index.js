const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const authentificationRoutes = require("./routes/authentification");
const offerRoutes = require("./routes/offer");

app.use(authentificationRoutes);
app.use(offerRoutes);

app.get("/", (req, res) => {
  res.status(201).json({ message: "Bienvenue sur le site de vinted !!" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not available !!" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started 🚀🚀🚀!");
});
