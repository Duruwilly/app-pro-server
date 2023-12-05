import Flutterwave from "flutterwave-node-v3";
import got from "got";
import Transactions from "../models/Transactions.js";
import { CustomError } from "../utils/helpers.js";

const flutterwave = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY,
  process.env.FLUTTERWAVE_SECRET_KEY
);

export const paymentTransactions = async (req, res, next) => {
  const customersTransactions = new Transactions(req.body);
  console.log(customersTransactions);
  if (customersTransactions.email === "") {
    return next(new CustomError("Kindly provide email address", 400));
  }
  try {
    const response = await got
      .post("https://api.flutterwave.com/v3/payments", {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
        json: {
          tx_ref: customersTransactions.trans_id,
          amount: customersTransactions.price,
          currency: customersTransactions.currency,
          payment_options: "card, banktransfer, ussd",
          // redirect_url: "http://localhost:3001/transactions",
          // callback_url:
          //   "http://localhost:8800/api/v1/transactions/payment-callback",
          customer: {
            phonenumber: customersTransactions.mobileNumber,
            email: customersTransactions.email,
          },
        },
      })
      .json();
    await customersTransactions.save();

    return res.json({ response });
  } catch (error) {
    return next(error);
  }
};

export const fltveWebhook = async (req, res, next) => {
  const { status, tx_ref, transaction_id } = req.body;
  console.log(tx_ref);
};
