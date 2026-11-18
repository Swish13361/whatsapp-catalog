import mongoose from "mongoose";
import Product from "../models/product.js";
import config from "../config/index.js";
import { Client, Storage } from "node-appwrite";

async function connectDB() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");
}

function getAppwriteClient() {
  const client = new Client()
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId)
    .setKey(config.appwrite.apiKey);
  return new Storage(client);
}

function getImageUrl(fileId) {
  if (!fileId) return "";
  return `${config.appwrite.endpoint}/storage/buckets/${config.appwrite.bucketId}/files/${fileId}/preview?project=${config.appwrite.projectId}`;
}

async function listProductsWithoutImages() {
  const products = await Product.find({ $or: [{ imageUrl: { $exists: false } }, { imageUrl: "" }, { imageUrl: null }] })
    .select("_id name imageUrl imageFileId")
    .lean();

  console.log(`\nProducts without images (${products.length}):`);
  products.forEach((p) => {
    console.log(`  - ${p._id}: ${p.name}`);
  });
  return products;
}

async function attachImageToProduct(productId, fileId) {
  const storage = getAppwriteClient();
  try {
    const file = await storage.getFile(config.appwrite.bucketId, fileId);
    console.log(`File ${fileId} exists: ${file.name} (${file.sizeOriginal} bytes)`);
  } catch (err) {
    console.error(`File ${fileId} not found in Appwrite:`, err.message);
    return;
  }

  const imageUrl = getImageUrl(fileId);
  const product = await Product.findByIdAndUpdate(
    productId,
    { imageFileId: fileId, imageUrl },
    { new: true }
  );

  if (product) {
    console.log(`Updated product ${product._id}: ${product.name}`);
    console.log(`  imageFileId: ${product.imageFileId}`);
    console.log(`  imageUrl: ${product.imageUrl}`);
  } else {
    console.error(`Product ${productId} not found`);
  }
}

async function main() {
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "list") {
    await listProductsWithoutImages();
  } else if (command === "attach" && args[1] && args[2]) {
    await attachImageToProduct(args[1], args[2]);
  } else {
    console.log(`
Usage:
  node scripts/attachImages.js list                    # List products without images
  node scripts/attachImages.js attach <productId> <fileId>  # Attach existing Appwrite file to product
`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});