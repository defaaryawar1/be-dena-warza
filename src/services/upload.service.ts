import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file: Express.Multer.File): Promise<UploadApiResponse> => {
    const isImage = file.mimetype.startsWith('image/');

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: isImage ? 'image' : 'video',
                format: isImage ? 'webp' : 'mp4',
                transformation: isImage ? [
                    { quality: "auto:best" },
                    { fetch_format: "webp" }
                ] : [
                    { quality: "auto:best" }, 
                    { format: "mp4" }
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Upload failed'));
                resolve(result);
            }
        );

        const readableStream = new Readable();
        readableStream._read = () => { };
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Re-export the UploadApiResponse type if needed elsewhere
export type { UploadApiResponse as CloudinaryResponse };