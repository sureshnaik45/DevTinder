const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const express = require("express");
const requestsRouter = express.Router();

const User_Data = "firstName lastName photoUrl age gender about skills";

requestsRouter.get("/requests/received", userAuth, async (req, res) => {
    try {
        const connectionRequests = await ConnectionRequest.find({
            toUserId:req.user._id,
            status:"interested"
        }).populate("fromUserId", User_Data); // the array contains what fields we need from the
        // document, if we don't pass anything it will fetch the whole document ["firstName", "lastName"] or
        // "firstName lastName" both are same, here we seperate the fields with space

        res.json({message:"Data fetched successfully", data:connectionRequests});

    } catch(err) {
        console.log( err.message);
        return res.status(400).json({message: "Error related to data fetch :) "});
    }
})

requestsRouter.get("/requests/sent", userAuth, async (req, res) => {
    try {
        const sentRequests = await ConnectionRequest.find({
            fromUserId:req.user._id,
            status:"interested",
        }).populate("toUserId", User_Data)
        res.json({message:"Data fetched successfully", data:sentRequests});
    } catch(err) {
        return res.status(400).json({message:"Error to fetch requests sent data :) "});
    }
})


requestsRouter.delete("/request/cancel/:requestId", userAuth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const userId = req.user._id.toString();
    const isSender = request.fromUserId.toString() === userId;
    const isReceiver = request.toUserId.toString() === userId;

    // Allow cancel if status is "interested" and user is sender
    if (request.status === "interested" && isSender) {
      await ConnectionRequest.findByIdAndDelete(requestId);
      return res.json({ message: "Request canceled successfully" });
    }

    // Allow removal if status is "accepted" and user is sender or receiver
    if (request.status === "accepted" && (isSender || isReceiver)) {
      await ConnectionRequest.findByIdAndDelete(requestId);
      return res.json({ message: "Connection removed successfully" });
    }

    return res.status(403).json({ message: "Unauthorized or invalid request status" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Server error related to request :)"});
  }
});


module.exports = requestsRouter;