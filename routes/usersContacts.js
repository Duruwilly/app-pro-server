import express from "express";
import {
  addContact,
  deleteContact,
  getContact,
  getContactImage,
} from "../controllers/UsersContactsController.js";
import { verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

router.post("/:id", verifyUser, addContact);
router.get("/:id", verifyUser, getContact);
router.post("/get-contact-image/:id", verifyUser, getContactImage);
router.delete(
  "/:id/delete-contact/:contactId/:contactAuthId",
  verifyUser,
  deleteContact
);

export default router;
