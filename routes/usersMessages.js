import express from "express";
import { verifyUser } from "../utils/verifyToken.js";
import {
  deleteMessage,
  deleteMessages,
  getReceivedMessages,
  getSentMessages,
} from "../controllers/MessagesController.js";

const router = express.Router();

router.get("/received-messages/:id", verifyUser, getReceivedMessages);
router.get("/sent-messages/:id", verifyUser, getSentMessages);
router.delete("/delete-message/:id/:messageId", verifyUser, deleteMessage);
router.delete(
  "/:id/delete-messages/:contactAuthId",
  verifyUser,
  deleteMessages
);

export default router;
