import express from "express";
import {
  forgotpassword,
  //   getpasswordLink,
  login,
  register,
  resetpassword,
} from "../controllers/UsersAuthController.js";
import { refreshAccessToken } from "../utils/refreshAccessToken.js";
import { removePushToken } from "../utils/helpers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/forgotPassword", forgotpassword);
router.route("/resetpassword/:resetToken").post(resetpassword);
router.post("/remove-push-token", removePushToken);

export default router;
