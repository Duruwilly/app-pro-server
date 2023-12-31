import Messages from "../models/Messages.js";

// save messages to db func
export const saveMessageToDB = async (messageData) => {
  try {
    const newMessage = new Messages(messageData);
    await newMessage.save();
    return newMessage;
  } catch (error) {
    throw error;
  }
};

// func to get received messages
export const getReceivedMessages = async (req, res, next) => {
  const { id } = req?.user;
  //   console.log(id);
  try {
    const receivedMessages = await Messages.find({
      receiverId: id,
      isMessageReceived: true,
    });
    // console.log(receivedMessages);
    return res.status(200).json({ status: "success", data: receivedMessages });
  } catch (error) {
    return next(error);
  }
};

// func to get sent messages
export const getSentMessages = async (req, res, next) => {
  const { id } = req?.user;
  try {
    const sentMessages = await Messages.find({
      senderId: id,
      isMessageSent: true,
    });
    return res.status(200).json({ status: "success", data: sentMessages });
  } catch (error) {
    return next(error);
  }
};

// func to delete messages after deleting contact
export const deleteMessages = async (
  req,
  res,
  next
  // contactId,
  // contactAuthId
) => {
  try {
    // const messagesToDelete = await Messages.find({
    //   $or: [
    //     { senderId: contactAuthId, isMessageReceived: true },
    //     { senderId: req.params.id, isMessageSent: true },
    //   ],
    // });
    const deleteCriteria = {
      $or: [
        {
          senderId: req.params.contactAuthId,
          receiverId: req.params.id,
          isMessageReceived: true,
        },
        {
          senderId: req.params.id,
          receiverId: req.params.contactAuthId,
          isMessageSent: true,
        },
      ],
    };

    await Messages.deleteMany(deleteCriteria);
    return res
      .status(200)
      .json({ status: "success", message: "messages deleted" });
  } catch (error) {
    return next(error);
  }
};

// function to delete a message
export const deleteMessage = async (req, res, next) => {
  try {
    // const messageId = req.params.messageId;
    // const userId = req.params.id;
    const { messageId, id } = req.params;

    await Messages.deleteOne({
      $or: [
        { uniqueMessageId: messageId, isMessageSent: true, senderId: id },
        {
          uniqueMessageId: messageId,
          isMessageReceived: true,
          receiverId: id,
        },
      ],
    });

    return res
      .status(200)
      .json({ status: "success", message: "message deleted" });
  } catch (error) {
    return next(error);
  }
};

// mark as read message func
export const markAsReadMessage = async (messageIds, receiverId) => {
  try {
    const updateResult = await Messages.updateMany(
      {
        uniqueMessageId: { $in: messageIds },
        receiverId: receiverId,
      },
      { $set: { isRead: true } }
    );
    // if (updateResult.acknowledged) {
    //   console.log("Messages marked as read");
    // } else {
    //   console.log("Failed to mark messages as read");
    // }
  } catch (error) {}
};

// remove messages for all
export const removeMessageForAll = async (req, res, next) => {
  try {
    const { messageId, receiverId } = req.params;
    await Messages.deleteMany({
      uniqueMessageId: messageId,
      receiverId,
    });
    return res
      .status(200)
      .json({ status: "success", message: "message removed" });
  } catch (error) {
    return next(error);
  }
};
