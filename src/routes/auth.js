

// // File: routes/auth.js
// const express = require("express");
// const validateSignUpData = require("../utils/validation").validateSignUpData;
// const bcrypt = require("bcrypt");
// const User = require("../models/user");

// const authRouter = express.Router();



// // SIGNUP
// authRouter.post("/signup", async (req, res) => {
//   try {
//     // validate incoming data
//     validateSignUpData(req); // your function expects req and uses req.body

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

//     // normalize email same as schema
//     const normalizedEmail = String(email).trim().toLowerCase();

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
//       skills: skills ?? [],
//     };

//     const user = new User(userObj);
//     const savedUser = await user.save();

//     const token = await savedUser.getJWT();

//     // ✅ good as you wrote
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // only https in production
//       sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//       expires: new Date(Date.now() + 8 * 3600000), // 8 hrs
//     });

//     // ✅ single success response, structure matches frontend usage
//     return res.status(201).json({
//       message: "User Signed Up Successfully",
//       data: savedUser,
//     });
//   } catch (err) {
//     console.error("SIGNUP ERROR:", err);
//     return res.status(400).send(err.message || "Signup failed");
//   }
// });

// // LOGIN
// authRouter.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // ⭐ normalize email same as signup
//     const normalizedEmail = String(email).trim().toLowerCase();

//     // 1. Find user
//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user) {
//       throw new Error("Invalid Credentials");
//     }

//     // 2. Compare entered password with hashed password in DB
//     const isPasswordValid = await user.validatePassword(password);

//     if (isPasswordValid) {
//       const token = await user.getJWT();

//       // ⭐ use the SAME cookie options as signup
//       res.cookie("token", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//         expires: new Date(Date.now() + 8 * 3600000),
//       });

//       // If valid → success
//       return res.send(user);
//     } else {
//       throw new Error("Invalid Credentials");
//     }
//   } catch (err) {
//     return res.status(400).send(err.message);
//   }
// });

// // LOGOUT
// authRouter.post("/logout", (req, res) => {
//   // ⭐ clear cookie with matching flags (important for strict/sameSite/secure)
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//   });
//   res.send("User Logged Out Successfully");
// });

// module.exports = authRouter;



// File: routes/auth.js
// const express = require("express");
// const validateSignUpData = require("../utils/validation").validateSignUpData;
// const bcrypt = require("bcrypt");
// const User = require("../models/user");

// const authRouter = express.Router();

// // 🔐 common cookie options (works for localhost + production)
// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",              // https on Render
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ❗ NONE for cross-site
//   expires: new Date(Date.now() + 8 * 3600000),                // 8 hours
// };

// // SIGNUP
// authRouter.post("/signup", async (req, res) => {
//   try {
//     validateSignUpData(req);

//     const { firstName, lastName, email, password, skills } = req.body;

//     if (skills !== undefined) {
//       if (!Array.isArray(skills)) {
//         throw new Error("Skills must be an array of strings");
//       }
//       if (skills.length > 10) {
//         throw new Error("Skills cannot be more than 10");
//       }
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();

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
//       skills: skills ?? [],
//     };

//     const user = new User(userObj);
//     const savedUser = await user.save();

//     const token = await savedUser.getJWT();

//     // ✅ use common cookie options
//     res.cookie("token", token, cookieOptions);

//     return res.status(201).json({
//       message: "User Signed Up Successfully",
//       data: savedUser,
//     });
//   } catch (err) {
//     console.error("SIGNUP ERROR:", err);
//     return res.status(400).send(err.message || "Signup failed");
//   }
// });

// // LOGIN
// authRouter.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const normalizedEmail = String(email).trim().toLowerCase();

//     const user = await User.findOne({ email: normalizedEmail });
//     if (!user) {
//       throw new Error("Invalid Credentials");
//     }

//     const isPasswordValid = await user.validatePassword(password);

//     if (!isPasswordValid) {
//       throw new Error("Invalid Credentials");
//     }

//     const token = await user.getJWT();

//     // ✅ same cookie options as signup
//     res.cookie("token", token, cookieOptions);

//     return res.send(user);
//   } catch (err) {
//     return res.status(400).send(err.message);
//   }
// });

// // LOGOUT
// authRouter.post("/logout", (req, res) => {
//   // clear cookie with matching flags
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: cookieOptions.secure,
//     sameSite: cookieOptions.sameSite,
//   });
//   res.send("User Logged Out Successfully");
// });

// module.exports = authRouter;


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
  maxAge: 8 * 60 * 60 * 1000,                             // 8 hours
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

    const token = await savedUser.getJWT();

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

    const token = await user.getJWT();

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
