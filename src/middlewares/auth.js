const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        if (!token) {
            return res.status(401).send("Token is not valid. Login again.");  
        }
        const verifiedToken = await jwt.verify(token, "DEVTinder@0");
        const {_id} = verifiedToken;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).send("User not found. Login again.");
        }
        req.user = user;
        next();
    } catch(err) {
        return res.status(400).send("ERROR : " + err.message);
    }
};

module.exports = {userAuth};