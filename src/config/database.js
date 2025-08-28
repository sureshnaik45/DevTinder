const mongoose = require('mongoose');
const connectDB = async () => {
    await mongoose.connect('')
    // in the above use your db string which you can get from mongodb compass
};
module.exports = connectDB;