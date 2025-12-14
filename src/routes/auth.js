// File: routes/auth.js
const express = require("express");
const validateSignUpData = require("../utils/validation").validateSignUpData;
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

// 🔐 build cookie options per request
const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",          // https on Render
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, email, password, skills } = req.body;

    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        throw new Error("Skills must be an array of strings");
      }
      if (skills.length > 10) {
        throw new Error("Skills cannot be more than 10");
      }
    }

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

    const token = savedUser.getJWT();

    res.cookie("token", token, buildCookieOptions());

    return res.status(201).json({
      message: "User Signed Up Successfully",
      data: savedUser,
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(400).send(err.message || "Signup failed");
  }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }

    const token = user.getJWT();

    res.cookie("token", token, buildCookieOptions());

    return res.send(user);
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

// LOGOUT
authRouter.post("/logout", (req, res) => {
  const opts = buildCookieOptions();
  res.clearCookie("token", {
    httpOnly: true,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
  res.send("User Logged Out Successfully");
});

module.exports = authRouter;
