const socketIO = require("socket.io");
const Message = require("../models/message");
const fs = require("fs");               // 👈 add
const path = require("path");           // 👈 add

// directory where uploads are stored
const uploadsDir = path.join(__dirname, "..", "uploads"); // 👈 add

// track online users by userId
const onlineUsers = new Map(); // userId -> count of sockets

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // we will store userId on socket object
    socket.on("registerUser", ({ userId }) => {
      socket.userId = userId;

      // join personal room for notifications
      socket.join(`user:${userId}`);

      const current = onlineUsers.get(userId) || 0;
      onlineUsers.set(userId, current + 1);

      // broadcast this user online
      io.emit("userOnlineStatus", { userId, isOnline: true });
    });

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      console.log(firstName + " joined room " + roomId);
      socket.join(roomId);
    });

    // ✉️ send message + save
    socket.on(
      "sendMessage",
      async ({
        firstName,
        userId,
        targetUserId,
        text,
        messageType,
        fileUrl,
        fileName,
        mimeType,
        fileSize,
      }) => {
        const roomId = [userId, targetUserId].sort().join("_");

        try {
          const msgDoc = await Message.create({
            roomId,
            fromUserId: userId,
            toUserId: targetUserId,
            text: text || "",
            status: "sent",
            messageType: messageType || "text",
            fileUrl,
            fileName,
            mimeType,
            fileSize,
          });

          // chat room realtime
          io.to(roomId).emit("messageReceived", {
            _id: msgDoc._id,
            firstName,
            userId,
            text: msgDoc.text,
            createdAt: msgDoc.createdAt,
            status: msgDoc.status,
            messageType: msgDoc.messageType,
            fileUrl: msgDoc.fileUrl,
            fileName: msgDoc.fileName,
            mimeType: msgDoc.mimeType,
            fileSize: msgDoc.fileSize,
          });

          // notification room (we already set up user:<id> earlier)
          io.to(`user:${targetUserId}`).emit("messageNotification", {
            fromUserId: userId,
            firstName,
            text: msgDoc.text,
            createdAt: msgDoc.createdAt,
            messageId: msgDoc._id,
          });
        } catch (err) {
          console.error("Error saving message:", err);
        }
      }
    );

    // ✅ mark delivered
    socket.on("messageDelivered", async ({ messageId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          { status: "delivered" },
          { new: true }
        );
        if (!msg) return;
        const roomId = msg.roomId;
        io.to(roomId).emit("messageStatusUpdated", {
          messageId,
          status: "delivered",
        });
      } catch (err) {
        console.error("Error updating to delivered:", err);
      }
    });

    // ✅ mark seen
    socket.on("messageSeen", async ({ messageId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          { status: "seen" },
          { new: true }
        );
        if (!msg) return;
        const roomId = msg.roomId;
        io.to(roomId).emit("messageStatusUpdated", {
          messageId,
          status: "seen",
        });
      } catch (err) {
        console.error("Error updating to seen:", err);
      }
    });

    // ✍️ typing indicator
    socket.on("typing", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("stopTyping", ({ userId, targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join("_");
      socket.to(roomId).emit("stopTyping", { userId });
    });

    // 🗑 delete message + optional file
    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        const roomId = msg.roomId;

        // try to remove file from disk if present
        if (msg.fileUrl) {
          try {
            let filePath = msg.fileUrl;

            // if fileUrl is full http URL -> get path part
            if (filePath.startsWith("http")) {
              const urlObj = new URL(filePath);
              filePath = urlObj.pathname; // e.g. /uploads/xxx.png
            }

            const fileName = path.basename(filePath); // xxx.png
            const fullPath = path.join(uploadsDir, fileName);

            fs.unlink(fullPath, (err) => {
              if (err) {
                console.error(
                  "Error deleting file from disk:",
                  err.message
                );
              } else {
                console.log("Deleted file from disk:", fullPath);
              }
            });
          } catch (err) {
            console.error("File delete error:", err.message);
          }
        }

        // mark message as deleted in DB
        await Message.findByIdAndUpdate(
          messageId,
          {
            isDeleted: true,
            text: "This message was deleted",
            fileUrl: null,
            messageType: "text",
          },
          { new: true }
        );

        io.to(roomId).emit("messageDeleted", { messageId });
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        const current = onlineUsers.get(userId) || 0;
        if (current <= 1) {
          onlineUsers.delete(userId);
          io.emit("userOnlineStatus", { userId, isOnline: false });
        } else {
          onlineUsers.set(userId, current - 1);
        }
      }
      console.log("Socket disconnected:", socket.id);
    });

    socket.on("checkUserOnline", ({ targetUserId }) => {
      const isOnline = onlineUsers.has(targetUserId);
      socket.emit("userOnlineStatus", { userId: targetUserId, isOnline });
    });
  });
};

module.exports = initializeSocket;
