import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderPhoneNumber: {
    type: String,
  },
  senderName: {
    type: String,
  },
  message: {
    type: String,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isMessageReceived: {
    type: Boolean,
  },
  isMessageSent: {
    type: Boolean,
  },
  online: {
    type: Boolean,
  },
  isRead: {
    type: Boolean,
  },
  uniqueMessageId: {
    type: String,
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

const Messages = mongoose.model("Message", MessageSchema);
export default Messages;
