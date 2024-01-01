import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import { v2 as cloudinaryV2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: {
    folder: "linqswiftProfilePhotosFolder",
    allowed_formats: ["jpg", "png", "jpeg", "heic"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

export const upload = multer({ storage });
