const express = require("express");
const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const connectionRouter = express.Router();

const User_Data = "firstName lastName photoUrl age gender about skills";

connectionRouter.post("/connection/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({message:"Invalid status type " + status});
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(400).json({
                message:"The connection you're sending user is not found"
            });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId:toUserId, toUserId:fromUserId}
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({
                message:"Connection request already exits!"
            })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        });

        const data = await connectionRequest.save();
        res.json({
            message:req.user.firstName + req.user.lastName + " " + status + " with " + toUser.firstName +
                toUser.lastName,
            data
        });
    }
    catch(err) {
        res.status(400).send("ERROR : " + err.message);
    }
})

connectionRouter.post("/connection/review/:status/:requestId", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params;
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({message:"Status not valid"});
        } 

        const connectionRequest = await ConnectionRequest.findOne({
            _id:requestId,
            toUserId:loggedInUser._id,
            status:"interested"
        });

        if (!connectionRequest) {
            return res.status(404).json({message:"Connection request not found"});
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({message:"Connection request " + status, data});

    } catch(err) {
        res.status(400).send("ERROR : " + err.message);
    }

})

connectionRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: req.user._id, status: "accepted" },
        { fromUserId: req.user._id, status: "accepted" }
      ]
    })
      .populate("fromUserId", User_Data)
      .populate("toUserId", User_Data);

    const data = connectionRequests.map((row) => {
      // ✅ Define connectedUser before using it
      const connectedUser =
        row.fromUserId._id.toString() === req.user._id.toString()
          ? row.toUserId
          : row.fromUserId;

      return {
        ...connectedUser._doc,     // Spread user data
        requestId: row._id         // Include the connection request ID
      };
    });

    res.json({ message: "Data fetched successfully", data });

  } catch (err) {
    res.status(400).json({ message: "Error " + err.message });
  }
});


module.exports = connectionRouter;