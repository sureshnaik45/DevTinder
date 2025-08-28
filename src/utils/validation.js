const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || firstName.length < 2 || firstName.length > 20) {
    throw new Error("First name must be between 2 and 20 characters");
  }

  if (lastName && lastName.length > 20) {
    throw new Error("Last name must be less than or equal to 20 characters");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email format");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};


const validateEditProfileData = (req) => {
  const {
    firstName,
    lastName,
    age,
    gender,
    photoUrl,
    about,
    skills
  } = req.body;

  // Field name check
  const allowedFields = [
    "firstName", "lastName", "emailId", "photoUrl", "gender", "age", "about", "skills"
  ];
  const isValidKeys = Object.keys(req.body).every((field) =>
    allowedFields.includes(field)
  );
  if (!isValidKeys) return false;

  // Value checks
  if (!firstName || firstName.length < 2 || firstName.length > 20) {
    throw new Error("First name must be between 2 and 20 characters");
  }

  if (lastName && lastName.length > 20) {
    throw new Error("Last name must be less than or equal to 20 characters");
  }

  if (age !== undefined && (isNaN(age) || age < 7 || age > 107)) {
    throw new Error("Age must be between 7 and 107");
  }

  if (gender && !["male", "female", "others"].includes(gender.toLowerCase())) {
    throw new Error("Gender must be male, female, or others");
  }

  if (photoUrl && !validator.isURL(photoUrl)) {
    throw new Error("Photo URL is invalid");
  }

  if (about && about.length > 90) {
    throw new Error("About section must be less than 50 characters");
  }

  if (skills && (!Array.isArray(skills) || skills.length > 25)) {
    throw new Error("Skills must be an array with up to 25 items");
  }

  return true;
};



module.exports = {validateSignUp, validateEditProfileData};