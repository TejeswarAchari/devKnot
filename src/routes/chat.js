const express = require("express");
const { userAuth } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");              // 👈 add this

const Message = require("../models/message");

const chatRouter = express.Router();

// 🔹 Make sure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);               // 👈 use uploadDir
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// existing history route unchanged
chatRouter.get("/chat/history/:targetUserId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;

    const roomId = [loggedInUser._id.toString(), targetUserId]
      .sort()
      .join("_");

    const messages = await Message.find({ roomId })
      .sort("createdAt")
      .populate("fromUserId", "firstName lastName photoUrl");

    res.json({ data: messages });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(400).json({ message: err.message });
  }
});

// NEW: upload file/image and return its URL
chatRouter.post(
  "/chat/upload",
  userAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const fileUrl = `/uploads/${file.filename}`; // frontend: BASE_URL + fileUrl

      res.json({
        fileUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = chatRouter;
