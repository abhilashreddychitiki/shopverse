"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";

// Get the latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

// Get single product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug: slug },
  });

  return convertToPlainObject(product);
}

// Get single product by id
export async function getProductById(productId: string) {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
}: {
  query: string;
  limit?: number;
  page: number;
  category: string;
}) {
  // Build where conditions based on filters
  const where: any = {};

  // Add name search if query is provided
  if (query) {
    where.name = {
      contains: query,
      mode: "insensitive", // Case-insensitive search
    };
  }

  // Add category filter if provided
  if (category) {
    where.category = category;
  }

  // Get products with pagination
  const data = await prisma.product.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Get total count for pagination
  const dataCount = await prisma.product.count({ where });

  // Return products and pagination info
  return {
    data: convertToPlainObject(data),
    totalPages: Math.ceil(dataCount / limit),
    currentPage: page,
    totalProducts: dataCount,
  };
}

// Delete Product (Admin)
export async function deleteProduct(productId: string) {
  try {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    // Revalidate the admin products page
    revalidatePath("/admin/products");

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: formatError(error) };
  }
}

// Create Product
export async function createProduct(data: any) {
  try {
    // Validate and create product
    const product = insertProductSchema.parse(data);

    // Add the fields that are commented out in the schema
    const productData = {
      ...product,
      images: data.images || [],
      isFeatured: data.isFeatured || false,
      banner: data.banner || null,
      rating: 0,
      numReviews: 0,
    };

    await prisma.product.create({ data: productData });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, message: formatError(error) };
  }
}

// Update Product
export async function updateProduct(data: any) {
  try {
    // Validate and find product
    const validatedData = updateProductSchema.parse(data);
    const productExists = await prisma.product.findFirst({
      where: { id: data.id },
    });

    if (!productExists) throw new Error("Product not found");

    // Add the fields that are commented out in the schema
    const productData = {
      ...validatedData,
      images: data.images || productExists.images,
      isFeatured:
        data.isFeatured !== undefined
          ? data.isFeatured
          : productExists.isFeatured,
      banner: data.banner !== undefined ? data.banner : productExists.banner,
    };

    // Update product
    await prisma.product.update({
      where: { id: data.id },
      data: productData,
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, message: formatError(error) };
  }
}
