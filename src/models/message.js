const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // 🔽 NEW FIELDS FOR FILE/IMAGE
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: String,
    fileName: String,
    mimeType: String,
    fileSize: Number,
  },
  { timestamps: true }
);

// Compound index for efficient chat history queries
messageSchema.index({ roomId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
