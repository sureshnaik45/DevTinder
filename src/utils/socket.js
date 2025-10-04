const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const User = require('../models/user');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash('sha256')
        .update([userId, targetUserId].sort().join('_'))
        .digest('hex');
};

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.ORIGIN,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinChat', ({ userId, targetUserId }) => {
            if (userId && targetUserId) {
                const roomId = getSecretRoomId(userId, targetUserId);
                socket.join(roomId);
            }
        });

        socket.on('sendMessage', async ({ userId, targetUserId, text }) => {
            try {
                if (!userId || !targetUserId || !text) return;

                const roomId = getSecretRoomId(userId, targetUserId);
                let chat = await Chat.findOne({ participants: { $all: [userId, targetUserId] } });

                if (!chat) {
                    chat = new Chat({ participants: [userId, targetUserId], messages: [] });
                }
                
                const newMessage = { senderId: userId, text };
                chat.messages.push(newMessage);
                await chat.save();
                
                const lastMessage = chat.messages[chat.messages.length - 1];
                const sender = await User.findById(userId).select('firstName lastName photoUrl');
                
                const populatedMessage = {
                    ...lastMessage.toObject(),
                    senderId: sender.toObject()
                };

                io.to(roomId).emit('messageReceived', populatedMessage);

            } catch (err) {
                console.log("Socket sendMessage error:", err);
            }
        });
        
        socket.on('disconnect', () => {});
    });
};

module.exports = initializeSocket;