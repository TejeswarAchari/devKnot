// routes/chat.js
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");

const chatRouter = express.Router();

// GET /chat/history/:targetUserId
chatRouter.get("/chat/history/:targetUserId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { targetUserId } = req.params;

    const roomId = [loggedInUser._id.toString(), targetUserId]
      .sort()
      .join("_");

    const messages = await Message.find({ roomId })
      .sort("createdAt")
      .populate("fromUserId", "firstName");

    res.json({ data: messages });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = chatRouter;
