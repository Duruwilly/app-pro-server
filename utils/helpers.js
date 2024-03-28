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

// export const addPushToken = async (userId, pushToken) => {
//   try {
//     const user = await Users.findById(userId);
//     if (user) {
//       user.pushTokens.push(pushToken);
//       await user.save();
//     }
//   } catch (error) {}
// };

// add the user push token to their profile
export const addPushTokenOnLogin = async (userId, pushToken) => {
  try {
    const user = await Users.findById(userId);
    if (user) {
      // Remove null or undefined values from the pushTokens array
      // user.pushTokens = user.pushTokens.filter(
      //   (token) => token !== null && token !== undefined
      // );
      user.pushTokens = user.pushTokens.filter((token) => token !== null);

      // Push the new token
      user.pushTokens.push(pushToken);

      // Save the user
      await user.save();
    }
  } catch (error) {
    console.error(error);
  }
};

// delete the push token after the user has logged out
export const clearPushTokensOnLogout = async (req, res, next) => {
  try {
    const user = await Users.findById(req.body.userId);
    if (user) {
      // user.pushTokens = user.pushTokens.filter(
      //   (token) => token !== req.body.pushToken
      // );
      user.pushTokens = [];
      await user.save();
      return res.status(201).json({
        status: "success",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// NOT USED YET
export const getUserPushTokens = async (userId) => {
  try {
    const user = await Users.findById(userId);
    if (user) {
      return user.pushTokens;
    }
    return [];
  } catch (error) {
    return [];
  }
};

// detect the same user trying to login on multiple device but would still need to be worked on
export const detectMultipleLogins = async (userId, newPushToken) => {
  try {
    const user = await Users.findById(userId);
    const oldPushToken = user.pushTokens.join(" ");
    console.log("oldOut", oldPushToken);
    console.log("newtoken", newPushToken);
    if (user) {
      if (oldPushToken !== newPushToken) {
        user.pushTokens = [];
        // user.a

        console.log("oldIn", oldPushToken);
        console.log("newIn", newPushToken);
        user.pushTokens.push(newPushToken);

        // sendPushNotification({
        //   to: oldPushToken,
        //   sound: "default",
        //   title: "You've been logged out",
        //   body: "Another device has logged your account",
        // });
      }

      await user.save();
    }
  } catch (error) {}
};
