'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import { formatError } from '../utils';
import { insertReviewSchema } from '../validator';
import { prisma } from '@/db/prisma';

// Create & Update Review
export async function createUpdateReview(
  data: z.infer<typeof insertReviewSchema>
) {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    // Validate and store review data and userId
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user.id,
    });

    // Get the product being reviewed
    const product = await prisma.product.findFirst({
      where: { id: review.productId },
    });

    if (!product) throw new Error('Product not found');

    // Check if user has already reviewed this product
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId,
      },
    });

    // If review exists, update it, otherwise create a new one
    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // Update the review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            description: review.description,
            title: review.title,
            rating: review.rating,
          },
        });
      } else {
        // Create a new review
        await tx.review.create({ data: review });
      }

      // Get the average rating
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId },
      });

      // Get the number of reviews
      const numReviews = await tx.review.count({
        where: { productId: review.productId },
      });

      // Update rating and number of reviews
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numReviews,
        },
      });
    });

    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: 'Review updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Get Reviews by Product ID
export async function getReviewsByProductId(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: reviews,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      data: [],
    };
  }
}

// Get Review by Product ID and User ID
export async function getReviewByProductId(
  productId: string,
  userId: string
) {
  try {
    if (!userId) {
      return {
        success: true,
        data: null,
      };
    }

    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      data: null,
    };
  }
}
