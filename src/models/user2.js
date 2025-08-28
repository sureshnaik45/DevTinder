const mongoose = require("mongoose");
const validator = require("validator");
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
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;