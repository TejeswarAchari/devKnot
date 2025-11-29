const socketIO = require("socket.io");
const Message = require("../models/message"); // path as per your project

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
      async ({ firstName, userId, targetUserId, text }) => {
        const roomId = [userId, targetUserId].sort().join("_");

        try {
          const msgDoc = await Message.create({
            roomId,
            fromUserId: userId,
            toUserId: targetUserId,
            text,
            status: "sent",
          });

          // emit with status "sent"
          io.to(roomId).emit("messageReceived", {
            _id: msgDoc._id,
            firstName,
            userId,
            text,
            createdAt: msgDoc.createdAt,
            status: msgDoc.status,
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

    // 🗑️ delete message for everyone
    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const msg = await Message.findByIdAndUpdate(
          messageId,
          { isDeleted: true, text: "This message was deleted" },
          { new: true }
        );
        if (!msg) return;
        const roomId = msg.roomId;
        io.to(roomId).emit("messageDeleted", {
          messageId,
        });
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
  });
};

module.exports = initializeSocket;
