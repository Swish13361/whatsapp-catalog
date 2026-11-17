import { Client, Storage } from "node-appwrite";
import config from "../config/index.js";

let client = null;
let storage = null;

function ensureClient() {
  if (client) return storage;
  if (
    !config.appwrite.endpoint ||
    !config.appwrite.projectId ||
    !config.appwrite.apiKey ||
    !config.appwrite.bucketId
  ) {
    return null;
  }
  client = new Client();
  client
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);
  storage = new Storage(client);
  return storage;
}

const isConfigured = Boolean(
  config.appwrite.endpoint &&
    config.appwrite.projectId &&
    config.appwrite.apiKey &&
    config.appwrite.bucketId
);

export async function uploadImage(buffer, filename, mimeType) {
  const st = ensureClient();
  if (!st) throw new Error("Appwrite storage is not configured");
  const file = new File([buffer], filename, { type: mimeType || "application/octet-stream" });
  const result = await st.createFile(config.appwrite.bucketId, "unique()", file);
  return {
    fileId: result.$id,
    imageUrl: `${config.appwrite.endpoint}/storage/buckets/${config.appwrite.bucketId}/files/${result.$id}/preview?project=${config.appwrite.projectId}`,
  };
}

export async function deleteImage(fileId) {
  if (!fileId) return;
  const st = ensureClient();
  if (!st) return;
  try {
    await st.deleteFile(config.appwrite.bucketId, fileId);
  } catch {
    // ignore missing file errors
  }
}

export { isConfigured };
