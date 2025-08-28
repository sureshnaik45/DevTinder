const mongoose = require('mongoose');
const connectDB = async () => {
    await mongoose.connect('mongodb+srv://namastelearn:vHcmyKNDpRt2oUSz@namastelearn.1ffmcjv.mongodb.net/devTinder')
};
module.exports = connectDB;