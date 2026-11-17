// Static Products - Add your products manually here
// This file is used by both storefront and admin panel
// Products added here will appear in both places automatically

import { getStaticProductRemainingStock, isStaticProductInStock } from "../utils/staticProductStock.js";

export const staticProducts = [
  {
    _id: "static-1",
    name: "CCMAX PRO",
    description: "",
    category: "Templates",
    price: 40.,
    currency: "USD",
    imageUrl: "/public/IMG-20261117-WA0163.jpg",
    stock: 100,
    isActive: true,
    inStock: true,
    isNew: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchant: "static"
  },
  {
    _id: "static-2",
    name: "CCMAX MAX",
    description: "Professional UI component library with 200+ components, dark mode support, and TypeScript definitions. Ready to use in your next project.",
    category: "Development",
    price: 135.0,
    currency: "USD",
    imageUrl: "/public/IMG-20261117-WA0164.jpg",
    stock: 50,
    isActive: true,
    inStock: true,
    isNew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchant: "static"
  },
  {
    _id: "static-3",
    name: "AZ GPT/AZ CLAUDE",
    description: "Step-by-step guide to building a profitable e-commerce business from scratch. Includes templates, checklists, and case studies.",
    category: "Education",
    price: 10000.00,
    currency: "USD",
    imageUrl: "/public/IMG-20261117-WA0165.jpg",
    stock: null, // null = unlimited stock
    isActive: true,
    inStock: true,
    isNew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchant: "static"
  },
  {
    _id: "static-4",
    name: "Stock Photo Bundle - Nature",
    description: "100 high-resolution nature photographs for commercial use. Perfect for websites, marketing, and print materials.",
    category: "Photos",
    price: 39.99,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop",
    stock: 25,
    isActive: true,
    inStock: true,
    isNew: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchant: "static"
  },
  {
    _id: "static-5",
    name: "Font Collection - Modern Sans",
    description: "20 modern sans-serif font families with multiple weights. Includes web font licenses for unlimited projects.",
    category: "Fonts",
    price: 24.99,
    currency: "USD",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop",
    stock: 0, // Out of stock
    isActive: true,
    inStock: false,
    isNew: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    merchant: "static"
  },
];

function applyStockTracking(product) {
  const remainingStock = getStaticProductRemainingStock(product);
  const inStock = isStaticProductInStock(product);
  return {
    ...product,
    stock: remainingStock,
    inStock,
    originalStock: product.stock,
    soldCount: product.stock !== null && product.stock !== undefined ? (product.stock - (remainingStock || 0)) : 0,
  };
}

// Helper function to get all static products with updated stock
export function getStaticProducts() {
  return staticProducts.map(applyStockTracking);
}

// Helper function to get only active static products with updated stock
export function getActiveStaticProducts() {
  return staticProducts.filter(product => product.isActive).map(applyStockTracking);
}

// Helper function to find a static product by ID with updated stock
export function getStaticProductById(id) {
  const product = staticProducts.find(product => product._id === id);
  return product ? applyStockTracking(product) : null;
}