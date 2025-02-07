import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
import path from "path";

dotenv.config({ path: path.resolve('./config/.env') })

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `CARMATE/${folder}` },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};


// Function to delete an image from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Extract full public_id including folders
        const urlParts = imageUrl.split("/");
        const filenameWithExt = urlParts.pop(); // Get the last part (filename.jpg)
        const folderPath = urlParts.slice(7).join("/"); // Extract path after Cloudinary domain
        const publicId = `${folderPath}/${filenameWithExt.split(".")[0]}`; // Remove extension

        console.log(`Deleting from Cloudinary: ${publicId}`);

        // Delete image
        const result = await cloudinary.v2.uploader.destroy(publicId);
        if (result.result !== "ok") {
            console.error("Cloudinary deletion failed:", result);
            throw new Error("Cloudinary image deletion failed");
        }
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new Error("Cloudinary API error");
    }
};