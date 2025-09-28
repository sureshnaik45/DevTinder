require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = async () => {
    await mongoose.connect(process.env.DB_CONNECTION_SECRET); // in .env create DB_CONNECTION_SECRET 
};
module.exports = connectDB;