const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const User = require('../models/user');

const getSecretRoomId = (userId, targetUserId) => {
    return crypto
        .createHash('sha256')
        .update([userId, targetUserId].sort().join('_'))
        .digest('hex');
}

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: process.env.ORIGIN,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('joinChat', ({ userId, targetUserId }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            socket.join(roomId);
        });
        socket.on('sendMessage', async ({ userId, targetUserId, text }) => {
            try {
                const roomId = getSecretRoomId(userId, targetUserId);
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] }
                });
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        messages: [],
                    });
                }
                const newMessage = {
                    senderId: userId,
                    text
                };
                chat.messages.push(newMessage);
                await chat.save();

                const populatedMessage = await Chat.populate(chat, {
                    path: 'messages.senderId',
                    select: 'firstName lastName photoUrl'
                });

                const sentMessage = populatedMessage.messages[populatedMessage.messages.length - 1];
                io.to(roomId).emit('messageReceived', sentMessage);
            } catch (err) {
                console.log(err);
            }
        });
        socket.on('disconnect', () => { });
    });
};

module.exports = initializeSocket;