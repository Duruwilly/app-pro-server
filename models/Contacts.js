import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  contactId: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  contactImage: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: "User", // Model to which it refers (User model)
  },
  contactAuthId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Contacts = mongoose.model("Contact", ContactSchema);
export default Contacts;
