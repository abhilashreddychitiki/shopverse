"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { formatError } from "../utils";
import { cartItemSchema, insertCartSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types";
import { Prisma } from "@prisma/client";
import { convertToPlainObject, round2 } from "../utils";
import crypto from "crypto";

const initializeCart = async () => {
  const cookieStore = cookies();
  let sessionCartId = (await cookieStore).get("sessionCartId")?.value;

  if (!sessionCartId) {
    sessionCartId = crypto.randomUUID();
    (await cookieStore).set("sessionCartId", sessionCartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  return sessionCartId;
};

// Calculate cart price based on items
const calcPrice = (items: z.infer<typeof cartItemSchema>[]) => {
  const itemsPrice = round2(
      items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};
export const addItemToCart = async (data: CartItem) => {
  try {
    const sessionCartId = await initializeCart();

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    const cart = await getMyCart();
    const item = cartItemSchema.parse(data);
    const product = await prisma.product.findFirst({
      where: { id: item.productId },
    });
    if (!product) throw new Error("Product not found");
    if (!cart) {
      // Create new cart object
      const newCart = insertCartSchema.parse({
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item]),
      });
      // Add to database
      await prisma.cart.create({
        data: newCart,
      });

      // Revalidate product page
      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: "Item added to cart successfully",
      };
    } else {
      // Check for existing item in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId
      );
      // If not enough stock, throw error
      if (existItem) {
        if (product.stock < existItem.qty + 1) {
          throw new Error("Not enough stock");
        }

        // Increase quantity of existing item
        (cart.items as CartItem[]).find(
          (x) => x.productId === item.productId
        )!.qty = existItem.qty + 1;
      } else {
        // If stock, add item to cart
        if (product.stock < 1) throw new Error("Not enough stock");
        cart.items.push(item);
      }

      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });

      revalidatePath(`/product/${product.slug}`);

      return {
        success: true,
        message: `${product.name} ${
          existItem ? "updated in" : "added to"
        } cart successfully`,
      };
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
export async function getMyCart() {
  // Check for session cart cookie
  const cookieStore = cookies();
  const sessionCartId = (await cookieStore).get("sessionCartId")?.value;
  if (!sessionCartId) return undefined;

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  });

  if (!cart) return undefined;

  // Convert Decimal values to strings
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    // Get session cart id
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Get product
    const product = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    // Check if cart has item
    const exist = (cart.items as CartItem[]).find(
      (x) => x.productId === productId
    );
    if (!exist) throw new Error("Item not found");

    // Check if cart has only one item
    if (exist.qty === 1) {
      // Remove item from cart
      cart.items = (cart.items as CartItem[]).filter(
        (x) => x.productId !== exist.productId
      );
    } else {
      // Decrease quantity of existing item
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
        exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    // Revalidate product page
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name}  ${
        (cart.items as CartItem[]).find((x) => x.productId === productId)
          ? "updated in"
          : "removed from"
      } cart successfully`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
