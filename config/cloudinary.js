const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bakeli-tontine/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

const preuveStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bakeli-tontine/preuves",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadPreuve = multer({ storage: preuveStorage });

module.exports = { cloudinary, uploadAvatar, uploadPreuve };
