const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Authentication token missing");
    }

    const decodedObj = await jwt.verify(token, "TejaSecretKey");
    const { userId } = decodedObj;

    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
      throw new Error("User not found");
    }
req.user = user;
    next();
  } catch (err) {
    return res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = {
  userAuth,
};
