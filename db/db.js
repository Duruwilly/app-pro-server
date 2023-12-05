import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionURL = process.env.MONGO_URI;

const connectDB = async () => {
  return mongoose.connect(connectionURL);
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("mongoDB connected!");
});

export default connectDB;
