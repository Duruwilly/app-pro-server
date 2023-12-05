import express from "express";
import { verifyUser } from "../utils/verifyToken.js";
import {
  getUser,
  updatePremium,
  updateUser,
} from "../controllers/UsersController.js";
import { upload } from "../helpers/cloudinaryConfig.js";

const router = express.Router();

router.get("/:id", verifyUser, getUser);
router.put("/:id", upload.single("userImage"), verifyUser, updateUser);
router.put("/emergency/:id", verifyUser, updatePremium);

export default router;
