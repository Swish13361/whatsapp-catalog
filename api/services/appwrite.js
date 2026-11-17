import { Client, Storage, InputFile } from "node-appwrite";
import config from "../config/index.js";

const client = new Client();
client
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId)
  .setKey(config.appwrite.apiKey);

const storage = new Storage(client);

const isConfigured = Boolean(
  config.appwrite.endpoint &&
    config.appwrite.projectId &&
    config.appwrite.apiKey &&
    config.appwrite.bucketId
);

export async function uploadImage(buffer, filename, mimeType) {
  if (!isConfigured) throw new Error("Appwrite storage is not configured");
  const file = await storage.createFile(
    config.appwrite.bucketId,
    "unique()",
    InputFile.fromBuffer(buffer, filename),
    undefined,
    mimeType ? [mimeType] : undefined
  );
  return {
    fileId: file.$id,
    imageUrl: `${config.appwrite.endpoint}/storage/buckets/${config.appwrite.bucketId}/files/${file.$id}/preview?project=${config.appwrite.projectId}`,
  };
}

export async function deleteImage(fileId) {
  if (!isConfigured || !fileId) return;
  try {
    await storage.deleteFile(config.appwrite.bucketId, fileId);
  } catch {
    // ignore missing file errors
  }
}

export { isConfigured };
