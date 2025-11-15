// utils/validation.js
const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};

const validateEditProfileData = (data) => {
  const allowedFields = ["firstName","lastName","age","email", "photoUrl", "about", "skills", "gender"];
  const isUpdateAllowed = Object.keys(data).every((k) => allowedFields.includes(k));
  return isUpdateAllowed;
}

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
