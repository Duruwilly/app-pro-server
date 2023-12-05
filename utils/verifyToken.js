import jwt from "jsonwebtoken";
import { CustomError } from "./helpers.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new CustomError("unathenticated", 401));
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return next(new CustomError("token is invalid", 401));
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
