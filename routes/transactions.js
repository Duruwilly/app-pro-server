import express from "express";
import {
  //   fltveWebhook,
  paymentTransactions,
} from "../controllers/TransactionsController.js";

const router = express.Router();

router.post("/pay", paymentTransactions);
// router.post("/webhook/flutterwave", fltveWebhook);

export default router;
