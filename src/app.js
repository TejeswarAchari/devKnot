
const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const validator = require("validator");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");
const User = require("./models/user");
const http = require("http");
const initializeSocket = require("./utils/socket");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config(); // ⭐ load .env once here

const app = express();
app.set("trust proxy", 1); 

// ⭐ use env-based origin so you can switch localhost → domain easily
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// ------------ CORS MIDDLEWARE (using cors package) -------------
app.use(
  cors({
    origin: CLIENT_ORIGIN, // ⭐ frontend origin from env
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// If you still want to manually handle OPTIONS, you can keep this,
// but usually cors() handles it already:
// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
initializeSocket(server);

// GET by email using query param: /user?email=someone@example.com
app.get("/user", async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) return res.status(400).send("Provide ?email=...");
  try {
    const users = await User.find({ email: userEmail });
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body._id;

  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User Deleted Sucessfully");
  } catch (err) {
    res.status(400).send("Something went Wrong");
  }
});

// PATCH route to update allowed fields
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  try {
    const AllowedUpdates = ["age", "photoUrl", "about", "skills", "gender"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      AllowedUpdates.includes(k)
    );

    if (!isUpdateAllowed) {
      return res.status(400).send("Update Not Allowed");
    }

    // If skills present, validate it's an array and limit length
    if (data.skills !== undefined) {
      if (!Array.isArray(data.skills)) {
        return res.status(400).send("Skills must be an array");
      }
      if (data.skills.length > 10) {
        return res.status(400).send("Skills cannot be more than 10");
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).send("User not found");

    res.json(updatedUser);
  } catch (err) {
    res.status(400).send("Something went wrong: " + err.message);
  }
});

// ⭐ use env port + fallback
const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database Connection Established");
    server.listen(PORT, () => {
      console.log(`Server running successfully at Port ${PORT}...`); // ⭐ updated log
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected !!", err.message);
  });
