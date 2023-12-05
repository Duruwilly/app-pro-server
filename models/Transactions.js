import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    trans_id: {
      type: String,
      required: true,
    },
    // reference_id: {
    //   type: String,
    //   unique: true,
    //   required: true,
    // },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: String,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transactions = mongoose.model("Transaction", TransactionSchema);

export default Transactions;
