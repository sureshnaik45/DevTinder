const express = require('express');
const { Chat } = require('../models/chat');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');
const { userAuth } = require('../middlewares/auth');

const chatRouter = express.Router();

// This route now supports pagination with ?page= and &limit=
chatRouter.get('/chat/:targetUserId', userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;

    // Pagination query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Load 10 messages per page
    const skip = (page - 1) * limit;

    try {
        // SECURITY CHECK: Verify that the two users have an accepted connection
        const connection = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: userId, toUserId: targetUserId },
                { fromUserId: targetUserId, toUserId: userId }
            ],
            status: 'accepted'
        });

        if (!connection) {
            return res.status(403).json({ message: "You are not connected with this user." });
        }

        // Find the target user to display their info in the chat header
        const targetUser = await User.findById(targetUserId).select('firstName lastName photoUrl');
        if (!targetUser) {
            return res.status(404).json({ message: "Chat partner not found." });
        }
        
        // Find the chat and get only a "slice" of the messages array
        const chat = await Chat.findOne(
            { participants: { $all: [userId, targetUserId] } },
            { messages: { $slice: [-limit * page, limit] } } // This is how we paginate the embedded array
        ).populate({
            path: 'messages.senderId',
            select: 'firstName lastName photoUrl'
        });

        if (!chat) {
            // If no chat exists, send back an empty array and the target user's info
            return res.json({
                messages: [],
                targetUser,
                hasMoreMessages: false
            });
        }
        
        // Check if there are more messages to load on older pages
        const totalMessages = await Chat.findOne({_id: chat._id}).then(c => c.messages.length);
        const hasMoreMessages = totalMessages > page * limit;

        res.json({
            messages: chat.messages || [],
            targetUser,
            hasMoreMessages
        });

    } catch (err) {
        console.error("Chat loading error:", err);
        res.status(500).json({ message: "Server error while fetching chat." });
    }
});

module.exports = chatRouter;