import Users from "../models/Users.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { updateContact } from "./UsersContactsController.js";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// get user
export const getUser = async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.id);
    const { _id, refreshToken, password, ...otherDetails } = user._doc;
    return res.status(200).json({ status: "success", data: otherDetails });
  } catch (error) {
    return next(error);
  }
};

// update a user
export const updateUser = async (req, res, next) => {
  try {
    const photoUrls = req?.file ? req?.file : undefined;
    console.log("photo", photoUrls);
    let imageUri = "";
    try {
      const result = await cloudinary?.uploader?.upload(photoUrls?.path);
      console.log("res", result);
      imageUri = result?.secure_url;
    } catch (error) {
      return next(error);
      console.log("errorhere", error);
    }
    const updateUser = await Users.findByIdAndUpdate(
      req?.params?.id,
      {
        $set: {
          ...req.body,
          userImage: imageUri,
        },
      },
      {
        new: true,
      }
    );
    // get the contact of the user to check if any of them have the user so as to update them with the user image
    updateContact(req, res, next, req?.params?.id);
    const { _id, refreshToken, password, ...otherDetails } = updateUser._doc;
    return res.status(200).json({
      status: "success",
      message: "profile updated successfully",
      data: otherDetails,
    });
  } catch (error) {
    return next(error);
  }
};

// update premium func
export const updatePremium = async (req, res, next) => {
  try {
    await Users.findByIdAndUpdate(
      req?.params?.id,
      {
        $set: {
          emergencyMessage: req?.body?.inputText,
          emergencyMessageEditCount: req?.body?.count,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      status: "success",
      message: "emergency messages updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};
