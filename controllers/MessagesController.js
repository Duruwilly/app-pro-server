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
    }).sort({ createdAt: 1 });
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
    }).sort({ createdAt: 1 });
    return res.status(200).json({ status: "success", data: sentMessages });
  } catch (error) {
    return next(error);
  }
};

// func to delete messages after deleting contact
export const deleteMessages = async (
  req,
  res,
  next,
  contactId,
  contactAuthId
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
          senderId: contactAuthId,
          receiverId: req.params.id,
          isMessageReceived: true,
        },
        {
          senderId: req.params.id,
          receiverId: contactAuthId,
          isMessageSent: true,
        },
      ],
    };

    return await Messages.deleteMany(deleteCriteria);
  } catch (error) {}
};

// function to delete a message
export const deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.params.id;

    await Messages.deleteOne({
      $or: [
        { uniqueMessageId: messageId, isMessageSent: true, senderId: userId },
        {
          uniqueMessageId: messageId,
          isMessageReceived: true,
          receiverId: userId,
        },
      ],
    });
    // console.log(test);
    // const messageToDelete = await Messages.findById(req.params.messageId);

    return res
      .status(200)
      .json({ status: "success", message: "message deleted" });
  } catch (error) {}
};

// mark as read message func
export const markAsReadMessage = async (messageId, receiverId) => {
  try {
    // console.log(messageId);
    const messagesToUpdateAsRead = await Messages.find({
      uniqueMessageId: messageId,
      receiverId: receiverId,
    });
    for (const message of messagesToUpdateAsRead) {
      await Messages.findByIdAndUpdate(
        message._id,
        { $set: { isRead: true } },
        { new: true }
      );
    }
    return messagesToUpdateAsRead;
  } catch (error) {}
};
