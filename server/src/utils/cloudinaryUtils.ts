import cloudinary from "../config/cloudinary";
import fs from "fs";

/**
 * Upload a file to Cloudinary
 * @param filePath Local path to the file
 * @param folder Cloudinary folder name
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (filePath: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto", // Auto-detect image vs raw (pdf)
    });

    // Remove file from local storage after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Remove file even if upload fails to prevent clutter
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId Cloudinary public ID of the file
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw error here, just log it.
    // We don't want to break the main flow if cleanup fails.
  }
};
