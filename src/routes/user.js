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
      }).populate("fromUserId", "firstName lastName about gender skills photoUrl lastSeen").lean();

      res.json({
        message: "Data fetched successfully",
        data: connectionRequests,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);


// Get all accepted connections of the logged-in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", "firstName lastName about age gender skills photoUrl lastSeen")
      .populate("toUserId", "firstName lastName about age gender skills photoUrl lastSeen");

    // Extract the "other user" from each connection
    const data = connectionRequests.map((row) => {
      const meId = loggedInUser._id.toString();
      const fromId = row.fromUserId._id.toString();
      const toId = row.toUserId._id.toString();

      return fromId === meId ? row.toUserId : row.fromUserId;
    });

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
    }).select("fromUserId toUserId").lean();

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
      _id: { $nin: Array.from(hideUsersFromFeed) },
    })
      .select("firstName lastName about age gender skills photoUrl lastSeen")
      .skip(skip)
      .limit(limit)
      .lean();

    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;

