const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user"); 

// Get all pending connection requests for the logged-in user
userRouter.get(
  "/user/requests/received",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      const connectionRequests = await ConnectionRequest.find({
        toUserId: loggedInUser._id,
        status: "interested",
      }).populate("fromUserId", "firstName lastName about gender skills photoUrl");

      res.json({
        message: "Data fetched successfully",
        data: connectionRequests,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);
//previous code 
// Get all accepted connections of the logged-in user
// userRouter.get(
//   "/user/connections",
//   userAuth,
//   async (req, res) => {
//     try {
//       const loggedInUser = req.user;

//       const connectionRequests = await ConnectionRequest.find({
//         $or: [
//           { toUserId: loggedInUser._id, status: "accepted" },
//           { fromUserId: loggedInUser._id, status: "accepted" },
//         ],
//       }).populate("fromUserId", "firstName lastName about age gender skills photoUrl").populate("toUserId", "firstName lastName about age gender skills photoUrl");
        
//  const data = connectionRequests.map((row) => {
//   if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
//     return row.toUserId;
//   }
//   return row.fromUserId;
// });

//       res.json({ data });
//     } catch (err) {
//       res.status(400).send({ message: err.message });
//     }
//   }
// );

// routes/user.js (or wherever your userRouter is)

// Get all accepted connections of the logged-in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }).select("fromUserId toUserId status"); // we just need ids here

    // For each connection, resolve the "other user" from User collection
    const data = await Promise.all(
      connectionRequests.map(async (row) => {
        const meId = loggedInUser._id.toString();

        const fromId = row.fromUserId.toString();
        const toId = row.toUserId.toString();

        const otherUserId = fromId === meId ? toId : fromId;

        // fetch full user doc
        const otherUser = await User.findById(otherUserId).select(
          "firstName lastName about age gender skills photoUrl"
        );

        return otherUser; // will be a clean user object
      })
    );

    return res.json({ data });
  } catch (err) {
    console.error("ERROR in /user/connections:", err);
    return res.status(400).send({ message: err.message });
  }
});




userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // ---------- pagination ----------
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    // max 50 per page
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    // ---------- get all connection requests of this user ----------
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id },
      ],
    }).select("fromUserId toUserId");

    // ---------- build set of users to hide from feed ----------
    const hideUsersFromFeed = new Set();

    // hide yourself
    hideUsersFromFeed.add(loggedInUser._id.toString());

    connectionRequests.forEach((reqObj) => {
      const from = reqObj.fromUserId.toString();
      const to = reqObj.toUserId.toString();
      const me = loggedInUser._id.toString();

      const otherUserId = from === me ? to : from;
      hideUsersFromFeed.add(otherUserId);
    });

    // ---------- fetch users for feed ----------
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, // not in hidden set
        { _id: { $ne: loggedInUser._id } },               // not me (extra safety)
      ],
    })
      .select("firstName lastName about age  gender skills photoUrl") // e.g. "firstName lastName about gender skills photoUrl"
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;

