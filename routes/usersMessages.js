import express from "express";
import { verifyUser } from "../utils/verifyToken.js";
import {
  deleteMessage,
  getReceivedMessages,
  getSentMessages,
} from "../controllers/MessagesController.js";

const router = express.Router();

router.get("/received-messages/:id", verifyUser, getReceivedMessages);
router.get("/sent-messages/:id", verifyUser, getSentMessages);
router.delete("/delete-message/:id/:messageId", deleteMessage);

export default router;
