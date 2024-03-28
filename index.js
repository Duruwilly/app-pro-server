import express from "express";
import { createServer } from "http";
import connectDB from "./db/db.js";
import configureSocketIO from "./socket/socketConnections.js";
import userAuthRoutes from "./routes/userAuth.js";
import usersRoutes from "./routes/users.js";
import usersContactRoute from "./routes/usersContacts.js";
import usersMessages from "./routes/usersMessages.js";
import transactionsRoutes from "./routes/transactions.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const server = createServer(app);

const port = process.env.PORT || 8050;
// const socketPort = process.env.SOCKET_PORT || 8200;

app.use(cors());
app.use(cookieParser()); // Middleware to parse cookies sent by the client in the HTTP request headers
app.use(express.json()); //  Middleware to parse JSON data from incoming requests
app.use(express.urlencoded({ extended: false })); // Middleware to parse URL-encoded data from incoming requests e.g to handle a POST request with URL-encoded form data

// Routes
app.use("/api/auth", userAuthRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/contacts", usersContactRoute);
app.use("/api/messages", usersMessages);
app.use("/api/transactions", transactionsRoutes);

app.use((err, req, res, next) => {
  // console.log(err);
  const errorStatus = err.status || 500;
  const errorMessage = err?.message || "something went wrong";
  return res?.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
  });
});

configureSocketIO(server);

// only run the server if the database is connected
const start = async () => {
  try {
    await connectDB();
    // httpServer.listen(socketPort);
    server.listen(port, () => {
      console.log(`port is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
