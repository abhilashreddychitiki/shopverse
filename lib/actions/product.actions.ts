"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Get the latest products
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
}

// Get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4,
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

// Get product categories
export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Filter by query
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  // Filter by category
  const categoryFilter = category && category !== "all" ? { category } : {};

  // Filter by price
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  // Filter by rating
  const ratingFilter =
    rating && rating !== "all" ? { rating: { gte: Number(rating) } } : {};

  // Get products with pagination
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Get total count for pagination
  const dataCount = await prisma.product.count({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
  });

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
export async function createProduct(
  data: z.infer<typeof insertProductSchema> & {
    isFeatured?: boolean;
    banner?: string | null;
    images?: string[];
  }
) {
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
export async function updateProduct(
  data: z.infer<typeof updateProductSchema> & {
    isFeatured?: boolean;
    banner?: string | null;
    images?: string[];
  }
) {
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
