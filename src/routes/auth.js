const express = require('express');
const validateSignUpData = require("../utils/validation").validateSignUpData;
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

// authRouter.post("/signup", async (req, res) => {

//   try {
//     validateSignUpData(req);
//     const { firstName, lastName, email, password, skills } = req.body;

//     // validate skills if provided
//     if (skills !== undefined) {
//       if (!Array.isArray(skills)) {
//         throw new Error("Skills must be an array of strings");
//       }
//       if (skills.length > 10) {
//         throw new Error("Skills cannot be more than 10");
//       }
//     }
//   // normalize email same as schema: trim & lowercase
//     const normalizedEmail = String(email).trim().toLowerCase();

//         // 1) Fast pre-check to give a friendly message
//     const existing = await User.findOne({ email: normalizedEmail });
//     if (existing) {
//       return res.status(409).send("Email already registered");
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const userObj = {
//       firstName,
//       lastName,
//       email: normalizedEmail,
//       password: passwordHash,
//       skills: skills ?? []   // default to [] if not provided
//     };

//     const user = new User(userObj);
//    const savedUser =  await user.save();
//  const token = await savedUser.getJWT();
        
//       res.cookie("token", token,{
//         expires: new Date(Date.now() + 8 * 3600000),
//       });

//       // If valid → success
//       return res.send(user);

//     res.json({Message:"User Signed Up Successfully",data: savedUser});
//   } catch (err) {
//   }
// });

// LOGIN ROUTE

authRouter.post("/signup", async (req, res) => {
  try {
    // validate incoming data
    validateSignUpData(req); // your function expects req and uses req.body

    const { firstName, lastName, email, password, skills } = req.body;

    // validate skills if provided
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        throw new Error("Skills must be an array of strings");
      }
      if (skills.length > 10) {
        throw new Error("Skills cannot be more than 10");
      }
    }

    // normalize email same as schema
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).send("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userObj = {
      firstName,
      lastName,
      email: normalizedEmail,
      password: passwordHash,
      skills: skills ?? [],
    };

    const user = new User(userObj);
    const savedUser = await user.save();

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 3600000),
      // sameSite / secure depending on your frontend-backend ports & https
    });

    // ✅ single success response, structure matches frontend usage
    return res.status(201).json({
      message: "User Signed Up Successfully",
      data: savedUser,
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(400).send(err.message || "Signup failed");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    // 2. Compare entered password with hashed password in DB
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
     
      const token = await user.getJWT();
        
      res.cookie("token", token);

      // If valid → success  
      return res.send(user);
    } 
    else {
      throw new Error("Invalid Credentials");
    }

  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("User Logged Out Successfully");
});

module.exports = authRouter;