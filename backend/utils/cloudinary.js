import dotenv from "dotenv";
dotenv.config();
import {v2 as cloudinary} from "cloudinary";

import fs from "fs";


// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);
// console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("cloudinary.js loaded");

// to upload files to cloudinary
export async function uploadToCloudinary(filePath, folder = "Doctors") {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });

    // remove the local file after upload
    fs.unlinkSync(filePath);

    return result;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

// to delete an image that is present in cloudinary if user removes from the UI
export async function deleteFromCloudinary(publicId) {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
}

export default cloudinary;