import { Server } from "socket.io";
import { addNewUsers, getUser, removeUser } from "./socketUtils.js";
import Contacts from "../models/Contacts.js";
import {
  markAsReadMessage,
  saveMessageToDB,
} from "../controllers/MessagesController.js";
import Users from "../models/Users.js";
import { encryptMessage } from "../utils/helpers.js";
import { sendPushNotification } from "../utils/pushNotification.js";

const configureSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // this takes event from the client when users connect or login
    socket.on("newUser", (userID, pushToken) => {
      console.log(pushToken, userID);
      addNewUsers(userID, pushToken, socket.id);
    });

    // get the sent message to emit to the receiver
    socket.on(
      "sendMessage",
      async ({
        // senderName,
        receiverId,
        createdAt,
        senderPhoneNumber,
        message,
        senderId,
        socketId,
        isRead,
        location,
        uniqueMessageId,
      }) => {
        let receiverSocketId;
        if (receiverId) {
          try {
            // get the list of contacts associated with the userId
            const userContact = await Contacts.find({ userId: receiverId });

            // get the sender of the message just to get the name
            const sender = userContact.find(
              (item) =>
                item.phoneNumber.replace(/\s/g, "") === senderPhoneNumber
            );

            // get  the receiver socket id using the receiver id
            const receiver = getUser(receiverId);
            receiverSocketId = receiver?.socketId;

            // Encrypt the message
            const encryptedMessage = encryptMessage(message);

            // for push notification
            await sendPushNotification({
              to: receiver?.pushToken,
              sound: "default",
              title: sender?.name,
              body: message,
            });

            // save message to db
            await saveMessageToDB({
              receiverId,
              createdAt,
              senderPhoneNumber,
              message: encryptedMessage,
              isMessageReceived: true,
              isMessageSent: false,
              senderId,
              senderName: sender.name,
              socketId,
              online: receiver?.online,
              isRead,
              uniqueMessageId,
              location,
            });

            // emit to the receiver
            if (sender) {
              io.to(receiverSocketId).emit("getNotification", {
                senderPhoneNumber,
                senderName: sender?.name,
                receiverId,
                senderId,
                createdAt,
                message: encryptedMessage,
                isMessageReceived: true,
                isMessageSent: false,
                isRead,
                uniqueMessageId,
                location,
              });
            }
          } catch (error) {
            io.to(receiverSocketId).emit("errorNotification", {
              message: "An error occurred while processing your request",
              // code: 500,
            });
          }
        }
      }
    );

    // the sender should also get the message they send
    socket?.on(
      "getMessageSent",
      async ({
        receiverId,
        createdAt,
        senderPhoneNumber,
        message,
        isMessageReceived,
        senderId,
        senderName,
        isRead,
        uniqueMessageId,
        location,
      }) => {
        if (senderId) {
          const sender = getUser(senderId);
          const receiver = getUser(receiverId);
          const senderSocketId = sender?.socketId;

          // Encrypt the message
          const encryptedMessage = encryptMessage(message);

          await saveMessageToDB({
            receiverId,
            createdAt,
            senderPhoneNumber,
            message: encryptedMessage,
            isMessageReceived: false,
            isMessageSent: true,
            senderId,
            senderName,
            online: receiver?.online,
            isRead,
            uniqueMessageId,
            location,
          });

          io.to(senderSocketId).emit("getMessageSent", {
            senderPhoneNumber,
            senderName: sender?.name,
            receiverId,
            senderId,
            createdAt,
            message: encryptedMessage,
            isMessageReceived: false,
            isMessageSent: true,
            online: receiver?.online,
            isRead,
            uniqueMessageId,
            location,
          });
        }
      }
    );

    // get the message and mark it as read then emit to both sender and receiver
    socket?.on(
      "markAsReadMessageData",
      async ({
        _id,
        createdAt,
        senderPhoneNumber,
        message,
        isMessageReceived,
        isMessageSent,
        senderName,
        online,
        senderId,
        receiverId,
        isRead,
        location,
        uniqueMessageId,
      }) => {
        const receiver = getUser(receiverId);
        const sender = getUser(senderId);
        // console.log("isRead");
        await markAsReadMessage(uniqueMessageId, receiverId);

        // if (!isRead) {
        io.to(sender?.socketId).emit("getMarkAsReadMessage", {
          _id,
          createdAt,
          senderPhoneNumber,
          message,
          isMessageReceived: false,
          isMessageSent: true,
          senderName,
          online,
          senderId,
          receiverId,
          isRead: true,
          uniqueMessageId,
          location,
        });

        io.to(receiver?.socketId).emit("getMarkAsReadMessage", {
          _id,
          createdAt,
          senderPhoneNumber,
          message,
          isMessageReceived: true,
          isMessageSent: false,
          senderName,
          online,
          senderId,
          receiverId,
          isRead: true,
          uniqueMessageId,
          location,
        });
        // }
      }
    );

    // update the user image to every contact that has the user
    socket?.on(
      "getUserIdToUpdateImage",
      async ({ userId, userPhoneNumber }) => {
        if (userId) {
          // console.log(userId);
          try {
            // get the user profile
            const userProfile = await Users.findOne({
              mobileNumber: userPhoneNumber,
            });
            const userContact = await Contacts.find({ userId }); // get all the user contact
            for (const contact of userContact) {
              const receiverId = String(contact?.contactAuthId);
              const receiver = getUser(receiverId);
              if (receiver?.socketId) {
                io.to(receiver.socketId).emit("getUpdatedImage", {
                  contactImage: userProfile.userImage,
                  contactAuthId: userId,
                  phoneNumber: userPhoneNumber,
                });
              }
            }
          } catch (error) {}
        }
      }
    );

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });

  return io;
};

export default configureSocketIO;
