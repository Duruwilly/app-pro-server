import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import { v2 as cloudinaryV2 } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinaryV2.config({
  cloud_name: "dwfemmam4",
  api_key: "313557567571526",
  api_secret: "Kpz4wvJZvdreXZEfxb4O85BkO3E",
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
