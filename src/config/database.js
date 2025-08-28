const mongoose = require('mongoose');
const connectDB = async () => {
    await mongoose.connect('');
    // place your db string above which you might obtain from mongodb compass
};
module.exports = connectDB;