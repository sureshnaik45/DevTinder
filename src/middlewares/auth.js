const jwt = require("jsonwebtoken");
const User = require("../models/user");
require('dotenv').config();

const userAuth = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        if (!token) {
            return res.status(401).send("Token is not valid. Login again.");  
        }
        const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET); // in .env create JWT_SECRET
        const {_id} = verifiedToken;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).send("User not found. Login again.");
        }
        req.user = user;
        next();
    } catch(err) {
        console.log(err.message);
        return res.status(400).send("User might not found or token is not valid. Try again :)");
    }
};

module.exports = {userAuth};

