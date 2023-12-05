import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide name"],
      minlength: 3,
      maxlength: 50,
    },
    country: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "please provide valid email",
      ],
      unique: true,
    },
    password: {
      type: String,
      required: true,
      match: [
        /(?=.*[0-9])(?=.*[!@#$%^&*_-])(?=.*[a-z])(?=.*[A-Z]).{6,}/,
        "password must contain at lease one special character, uppercase and lowercase letters with at least a number, and must be 6 character or more",
      ],
    },
    userImage: {
      type: String,
    },
    mobileNumber: {
      type: String,
      required: true,
      min: 8,
      max: 11,
      unique: true,
    },
    gender: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    isPremium: {
      type: Boolean,
    },
    emergencyMessage: {
      type: String,
    },
    emergencyMessageEditCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.createResetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins before the password token exires
  return resetToken;
};

const Users = mongoose.model("User", UserSchema);
Users.syncIndexes();
export default Users;
