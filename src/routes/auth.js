const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignUp } = require("../utils/validation");
const express = require("express");
const authRouter = express.Router();


authRouter.post("/signup", async (req, res) => {
    try {
        validateSignUp(req);
        const {firstName, lastName, emailId, password, age, gender, photoUrl, about, skills} = req.body;
        const passwordHash = await bcrypt.hash(password, 10); // 10 is the number of times it will make it
        // stronger
        const user = new User({
            firstName, lastName, emailId, password:passwordHash, age, gender, photoUrl, about, skills
        });
        const new_user = await user.save();
        const token = await new_user.getJWT();
        res.cookie("token", token, {expires: new Date(Date.now()+8*3600000)});
        res.json({message:"User added successfully", data:new_user});
    } catch(err) {
        console.log(err.message);
        res.status(400).send("Some error while adding the user :)");
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId:emailId});
        if (!user) {
            throw new Error("Invalid Credentials. Try again!")
        }
        const verify_password = await user.validatePassword(password);
        if (verify_password) {
            const token = await user.getJWT();
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,   // Essential for cross-site cookies
                sameSite: "none", // Allows the cookie to be sent from Vercel to Render
                expires: new Date(Date.now() + 8 * 3600000) // 8 hours
            });
            res.send(user);
        }
        else {
            throw new Error("Invalid Credentials. Try again!");
        }
    }
    catch(err) {
        console.log(err.message);
        res.status(400).send("Error related to login.");
    }
})

authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });
    res.send("Logged out successfully");
});

module.exports = authRouter;