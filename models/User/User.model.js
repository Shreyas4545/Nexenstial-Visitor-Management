// Import Dependencies
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        maxlength: [40, 'Name should be under 40 characters.']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    isImage: {
        type: Boolean
    },
    isDeactivated: {
        type: Boolean
    },
    isDeleted: {
        type: Boolean
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    organisationName: {
        type: String
    },
    accessId: {
        type: String
    },
    role: {
        type: String
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date
},
    {
        timestamps: true
    })

// encrypt password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// validate the password with passed on user password
userSchema.methods.isValidatedPassword = async function (usersendPassword, password) {
    return await bcrypt.compare(usersendPassword, password);
}

// create and return jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// generate forget password token (string)
userSchema.methods.getForgotPasswordToken = function () {
    // generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString("hex");

    // getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")

    // time of token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;  // 20 mins to expire password reset token

    return forgotToken;
}

const User = mongoose.model("User", userSchema);
export default User;