const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const DEFAULT_PROFILE_URL =
  "https://weimaracademy.org/wp-content/uploads/2021/08/dummy-user.png";

module.exports = { cloudinary, DEFAULT_PROFILE_URL };
