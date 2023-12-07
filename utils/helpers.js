import CryptoJS from "crypto-js";
import nodemailer from "nodemailer";
import Users from "../models/Users.js";

export const encryptMessage = (message) => {
  // const key = CryptoJS.enc.Utf8.parse(process.env.MESSAGE_SECRET_KEY);
  const encrypted = CryptoJS.AES.encrypt(
    message,
    process.env.MESSAGE_SECRET_KEY
  ).toString();
  return encrypted;
};

export const validatePassword = (password) => {
  // Regular expressions to match password criteria
  const regex = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>_-]/,
  };

  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  if (
    password?.length < 8 ||
    !regex.uppercase.test(password) ||
    !regex.lowercase.test(password) ||
    !regex.number.test(password) ||
    !regex.special.test(password)
  ) {
    return false;
  }

  return true;
};

// export const CustomError = (message: string, status: number) => {
//   const err = new Error();
//   (err as any).status = status;
//   err.message = message;
//   return err;
// };

export class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
  status;
}

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASSWORD,
    },
    // secure: true,
  });
  let mailOptions = {
    from: process.env.EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

export const addPushToken = async (userId, pushToken) => {
  try {
    const user = await Users.findById(userId);
    if (user) {
      user.pushTokens.push(pushToken);
      await user.save();
    }
  } catch (error) {
    // Handle errors
  }
};

export const removePushToken = async (userId, pushToken) => {
  try {
    const user = await Users.findById(userId);
    if (user) {
      user.pushTokens = user.pushTokens.filter((token) => token !== pushToken);
      await user.save();
    }
  } catch (error) {
    // Handle errors
  }
};

export const getUserPushTokens = async (userId) => {
  try {
    const user = await Users.findById(userId);
    if (user) {
      return user.pushTokens;
    }
    return [];
  } catch (error) {
    // Handle errors
    return [];
  }
};
