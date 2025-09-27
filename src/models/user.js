// you can write like this or else you can also write like the code present in user2.js
// all this code is related to mondodb mongoose, all the code syntax followed from mongodb
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        unique:true,
        required:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email address " + value);
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Your password is not strong " + value);
            }
        }
    },
    age:{
        type:Number,
        // min:18, // for string it is minLength, for numbers it's min means the age need to be 18 and > 18
        // max:100 // min and max values also included not excluded
        max:100
    },
    gender:{
        type:String,
        lowercase:true,
        validate(value) { // this will be validated the gender, it only allow if the genders are the ones
            // which are mentioned below and it will work only for the new entry data and not work with
            // updating data, if it also need to work for updating data, we need to use runValidators:true
            // wherever we updating this means in app.js file's app.patch function
            if (!['male','female', 'others'].includes(value)) {
                throw new Error("Cross check your gender"); 
            }
        }
    },
    photoUrl:{
        type:String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid Photo URL address " + value);
            }
        }
    },
    about:{
        type:String,
        default:"This is your about section. You can add like I'm a blockchain developer",
        // lowercase:true, // whatever entered will be converted to lowercase and stored in database
        // trim:true, // this will trim the spaces from left and right side
        // minLength:4, // when the user enters about it need to be atleast 4 characters
        // maxLength:100, // about need to be less than 100 characters
        
    },
    skills:{
        type:[String], // this will take the skills as an array or in array format
        validate(value) {
            if (value.length>20) {
                throw new Error(value.length + "but need less than 20");
            }
        }
    }
}, {
    timestamps:true, // this is like another argument which was taken by Schema, with this in the user's
    // data collection two more key:values added, createdAt:at what time created, updatedAt:at what time
    // updated
});

userSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn:"7d"}); // in .env create JWT_SECRET
    // After the secret key DevTinder we can also
    // set the expiry of the jwt token here itself {expiresIn:"7d"} 1d means 1day 1h means 1hour or else
    // we can even write in app.js file with express js
    return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

module.exports = mongoose.model("User", userSchema);