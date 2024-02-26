import { Server } from "socket.io";
import { addNewUsers, getUser, removeUser } from "./socketUtils.js";
import Contacts from "../models/Contacts.js";
import {
  markAsReadMessage,
  saveMessageToDB,
} from "../controllers/MessagesController.js";
import Users from "../models/Users.js";
import { encryptMessage, getUserPushTokens } from "../utils/helpers.js";
import { sendPushNotification } from "../utils/pushNotification.js";
import Messages from "../models/Messages.js";

const configureSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // this takes event from the client when users connect or login
    socket.on("newUser", (userID) => {
      addNewUsers(userID, socket.id);
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

            // get the receiver push token
            const receiverTokens = await getUserPushTokens(receiverId);
            // Encrypt the message
            const encryptedMessage = encryptMessage(message);

            // for push notification
            // sendPushNotification({
            //   to: receiverToken,
            //   sound: "default",
            //   title: sender?.name,
            //   body: message,
            // });

            // Send push notification for each token
            for (const receiverToken of receiverTokens) {
              try {
                await sendPushNotification({
                  to: receiverToken,
                  sound: "default",
                  title: sender?.name,
                  body: message,
                });
              } catch (error) {
                //  console.error(
                //    `Error sending push notification to ${receiverToken}:`,
                //    error
                //  );
              }
            }

            // emit to the receiver
            if (sender) {
              io.to(receiverSocketId).emit("getMessage", {
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
          } catch (error) {}
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
      async ({ senderId, receiverId, uniqueMessageIds }) => {
        const receiver = getUser(receiverId);
        const sender = getUser(senderId);
        await markAsReadMessage(uniqueMessageIds, receiverId);
        io.to(sender?.socketId).emit("getMarkAsReadMessage", {
          senderId,
          receiverId,
          uniqueMessageIds,
        });

        io.to(receiver?.socketId).emit("getMarkAsReadMessage", {
          senderId,
          receiverId,
          uniqueMessageIds,
        });
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

    // notify both users for message that was removed by the sender
    socket?.on(
      "removeMessageForAll",
      async ({ senderId, receiverId, uniqueMessageId }) => {
        const receiver = getUser(receiverId);
        const sender = getUser(senderId);
        try {
          const messages = await Messages.find({
            uniqueMessageId,
            receiverId,
          });
          io.to(sender.socketId).emit("getUpdatedMessage", {
            messages,
          });

          io.to(receiver.socketId).emit("getUpdatedMessage", {
            messages,
          });
        } catch (error) {}
      }
    );

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });

  return io;
};

export default configureSocketIO;
