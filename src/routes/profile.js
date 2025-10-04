const express = require("express");
const profileRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const {validateEditProfileData} = require("../utils/validation");
const { Chat } = require("../models/chat");

const User_Data = "firstName lastName photoUrl age gender about skills";

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err) {
        console.log(err.message);
        res.status(400).send("ERROR with profile :)" );
        // throw new Error("Something went wrong with profile")
    }
})

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
  try {
    const isValid = validateEditProfileData(req);
    if (!isValid) {
      return res.status(400).send("Invalid edit request");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ message: "Profile updated successfully", data: updatedUser });
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Profile update failed");
  }
});
profileRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10; // sanitizing the input data means user can be allowed to get only
        // upto 30 profiles to reduce the burden on data base, if limit > 30 it will set to 30 else limit
        // itself
        limit = limit > 30 ? 30 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });
        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } }, // nin - not in means all the ids expect which are
            // present in hideUsersFromFeed},
                {_id: {$ne:req.user._id}} // ne - not equals to
            ]
        }).select(User_Data).skip(skip).limit(limit + 1); // Fetch one extra

        const hasMore = users.length > limit;
        const usersToSend = users.slice(0, limit);

        res.json({ message: "Connect with the folks : ", data: usersToSend, hasMore });
    } catch (err) {
        console.log(err.message);
        res.status(400).json({ message: "ERROR : " });
    }
});

profileRouter.delete("/profile/delete", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        await ConnectionRequest.deleteMany({
            $or: [{ fromUserId: userId }, { toUserId: userId }]
        });
        await Chat.deleteMany({ participants: userId });
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });

        res.json({ message: "User account deleted successfully." });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server error while deleting account.");
    }
});

module.exports = profileRouter;