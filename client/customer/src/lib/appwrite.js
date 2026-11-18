import { Client, Storage, ID, Permission, Role } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "");

const storage = new Storage(client);

const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || "";

export async function uploadProductImage(file) {
  if (!BUCKET_ID) throw new Error("Appwrite bucket not configured");
  const result = await storage.createFile(
    BUCKET_ID,
    ID.unique(),
    file,
    [Permission.read(Role.any())]
  );
  const imageUrl = storage.getFileView(BUCKET_ID, result.$id).toString();
  return { fileId: result.$id, imageUrl };
}

export async function deleteProductImage(fileId) {
  if (!BUCKET_ID || !fileId) return;
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (err) {
    console.warn("Failed to delete Appwrite file:", err.message);
  }
}