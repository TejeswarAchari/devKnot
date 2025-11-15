const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status; // interested / ignore

      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({message: "Invalid status value"+status});
      }

      const toUserIdExists = await ConnectionRequest.find({ toUserId: toUserId });
      if (!toUserIdExists) {
        return res.status(404).json({ message: "The user you are trying to connect to does not exist." });
      }

      const existingRequest = await ConnectionRequest.findOne({
       $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if(existingRequest){
        return  res.status(409).json({ message: "Connection request already exists between these users." });
      }


      // Create new connection request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      await connectionRequest.save();

      res.json(
       { message: req.user.firstName+" "+ req.user.lastName +" is " +status+" "+ "for connection." }
      );

    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,               // must be the connection request _id
        toUserId: loggedInUser._id,   // logged-in user is the receiver
        status: "interested",         // make sure DB has same spelling
      });

      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({
        message: "Connection request " + status,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);



module.exports = requestRouter;


