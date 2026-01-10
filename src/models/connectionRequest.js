const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref:"User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "{VALUE} is incorrect status type",
      },
    },
  },
  { timestamps: true }
); 

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
    return next(new Error("fromUserId and toUserId cannot be the same"));
  }
    next();
});

// Compound indexes for efficient queries
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
connectionRequestSchema.index({ toUserId: 1, status: 1 });
connectionRequestSchema.index({ fromUserId: 1, status: 1 });

module.exports = mongoose.model("ConnectionRequestModel", connectionRequestSchema);
