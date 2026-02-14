import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv"

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFileToCloudinary = async (filePath, originalFileName) => {
  return cloudinary.uploader.upload(filePath, {
    folder: "smart-reconciliation/uploads",
    resource_type: "raw",
    use_filename: true,
    unique_filename: true,
    filename_override: originalFileName
  });
};

