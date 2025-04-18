"use server";
import { CartItem } from "@/types";
//eslint-disable-next-line
export async function addItemToCart(data: CartItem) {
  return { success: true, message: "Item added to cart" }; // Dummy response for now
}
