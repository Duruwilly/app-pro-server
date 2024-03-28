import jwt from "jsonwebtoken";
import { CustomError } from "./helpers.js";
import Users from "../models/Users.js";
// import { sendPushNotification } from "./pushNotification.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(req.headers.device_token);
  // const pushToken = req.headers.device_token;
  // console.log("here", pushToken);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new CustomError("unathenticated", 401));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
    if (err) return next(new CustomError("token is invalid", 401));

    // const userCheck = await Users.findById(user.id);
    // console.log("oldTokenAtVerify", userCheck.pushTokens[0], pushToken);
    // if (userCheck.pushTokens[0] !== pushToken) {
    //   console.log("hello");
    //   sendPushNotification({
    //     to: userCheck.pushTokens[0],
    //     sound: "default",
    //     title: "You've been logged out",
    //     body: "Another device has logged your account",
    //   });

    //   return next(new CustomError("unathenticated", 401));
    // }
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.id === req.params?.id) {
      next();
    } else {
      return next(new CustomError("unauthorized", 403));
    }
  });
};
