import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";

// Initialize S3 client for Replit Object Storage
const s3Client = new S3Client({
  endpoint: "https://storage.replit.com",
  region: "auto",
  credentials: {
    accessKeyId: process.env.REPLIT_OBJECT_STORAGE_KEY_ID || "",
    secretAccessKey: process.env.REPLIT_OBJECT_STORAGE_SECRET_KEY || "",
  },
});

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

if (!bucketId) {
  console.warn("⚠️ DEFAULT_OBJECT_STORAGE_BUCKET_ID not set - file uploads will fail");
}

interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to object storage
 * @param file - File buffer and metadata
 * @param folder - Optional folder path (e.g., 'videos', 'thumbnails')
 * @returns URL of uploaded file
 */
export async function uploadToObjectStorage(
  file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  },
  folder: string = ""
): Promise<UploadResult> {
  if (!bucketId) {
    throw new Error("Object storage not configured");
  }

  // Generate unique key
  const timestamp = Date.now();
  const randomString = randomBytes(8).toString("hex");
  const extension = file.originalname.split(".").pop();
  const key = folder
    ? `${folder}/${timestamp}-${randomString}.${extension}`
    : `${timestamp}-${randomString}.${extension}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: bucketId,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  // Return public URL
  const url = `https://storage.replit.com/${bucketId}/${key}`;
  
  return { url, key };
}

/**
 * Check if object storage is configured
 */
export function isObjectStorageConfigured(): boolean {
  return !!(
    bucketId &&
    process.env.REPLIT_OBJECT_STORAGE_KEY_ID &&
    process.env.REPLIT_OBJECT_STORAGE_SECRET_KEY
  );
}
