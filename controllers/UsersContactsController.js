import Contacts from "../models/Contacts.js";
import Users from "../models/Users.js";
import { CustomError } from "../utils/helpers.js";
import { deleteMessages } from "./MessagesController.js";

export const addContact = async (req, res, next) => {
  const newContact = new Contacts(req.body);
  try {
    const user = await Users.findOne({
      mobileNumber: newContact.phoneNumber.replace(/\s/g, ""),
    });
    if (user) {
      newContact.contactImage = user.userImage; // Add the user's profile picture to the contact
      newContact.contactAuthId = user._id; // to get the id of the user being added as a contact for sending message to them.
    } else {
      return next(
        new CustomError(
          `${newContact.name} does not have a linqSwift account`,
          404
        )
      );
    }

    const savedContact = await newContact.save();

    return res.status(201).json({
      status: "success",
      data: savedContact,
      message: "contact added",
    });
    // }
  } catch (error) {
    return next(error);
  }
};

// delete contact
export const deleteContact = async (req, res, next) => {
  try {
    const deletedContact = await Contacts.findByIdAndDelete(
      req.params.contactId
    );
    if (!deletedContact) {
      return next(new CustomError("contact not found", 404));
    }
    // delete the messages associated with the contact
    // await deleteMessages(
    //   req,
    //   res,
    //   next,
    //   req.params.contactId,
    //   req.params.contactAuthId
    // );
    return res
      .status(200)
      .json({ status: "success", message: "contact deleted" });
  } catch (error) {
    return next(error);
  }
};
//   // get the contact of the user to check if any of them have the user so as to update them with the user image
export const updateContact = async (req, res, next, userId) => {
  // console.log(userId, req.body.mobileNumber);
  try {
    // get the user by phone number
    const userProfile = await Users.findOne({
      mobileNumber: req.body.mobileNumber,
    });
    // console.log(userProfile);
    // find the user by phone number in the contact collection and update the image
    return await Contacts.findOneAndUpdate(
      {
        phoneNumber: req?.body?.mobileNumber,
      },
      {
        $set: {
          contactImage: userProfile?.userImage,
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {}
};

// get contact
export const getContact = async (req, res, next) => {
  try {
    const userContact = await Contacts.find({ userId: req.user.id });
    return res.status(200).json({ status: "success", data: userContact });
  } catch (error) {
    return next(error);
  }
};
