import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET_KEY
    );
    const userId = decoded.id;
    const user = await Users.findById(userId);
    if (!user || user.refreshToken !== refresh_token) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY);
    return res.status(200).json({ status: "success", accessToken });
  } catch (error) {
    return next(error);
  }
};
