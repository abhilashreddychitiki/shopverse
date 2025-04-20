"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult, ShippingAddress } from "@/types";
import { paypal } from "@/lib/paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { sendPurchaseReceipt } from "@/email";

// Local type definition for internal use
type PaymentResultType = {
  id: string;
  status: string;
  email_address: string;
  pricePaid: string;
};

// Create an order
export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not found");

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "Please add a shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "Please select a payment method",
        redirectTo: "/payment-method",
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });

      // Create order items and update product stock
      for (const item of cart.items as CartItem[]) {
        // Create order item
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });

        // Update product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.qty)
          throw new Error(`Not enough stock for ${item.name}`);

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.qty },
        });
      }

      // Clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error("Order not created");

    return {
      success: true,
      message: "Order successfully created",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// Update Order to Paid in Database
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResultType;
}) {
  // Find the order in the database and include the order items
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update the order and update the product quantities
  await prisma.$transaction(async (tx) => {
    // Update all item quantities in the database
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // Get the updated order after the transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  // Send the purchase receipt email with the updated order
  try {
    // Convert Decimal objects to strings to avoid serialization issues
    const serializedOrder = {
      ...updatedOrder,
      itemsPrice: String(updatedOrder.itemsPrice),
      shippingPrice: String(updatedOrder.shippingPrice),
      taxPrice: String(updatedOrder.taxPrice),
      totalPrice: String(updatedOrder.totalPrice),
      orderItems: updatedOrder.orderItems.map((item) => ({
        ...item,
        price: String(item.price),
      })),
      shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
      paymentResult: updatedOrder.paymentResult as PaymentResult,
    };

    await sendPurchaseReceipt({
      order: serializedOrder,
    });
  } catch (error) {
    console.error("Failed to send purchase receipt email:", error);
    // Don't throw the error as we don't want to fail the order update if email fails
  }
}

// Create a Paypal Order
export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0",
          },
        },
      });

      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Get order by ID
export async function getOrderById(id: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id },
      include: {
        orderItems: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) return null;

    // Convert Decimal objects to strings to avoid serialization issues
    const serializedOrder = {
      ...order,
      itemsPrice: String(order.itemsPrice),
      shippingPrice: String(order.shippingPrice),
      taxPrice: String(order.taxPrice),
      totalPrice: String(order.totalPrice),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: String(item.price),
      })),
    };

    return serializedOrder;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  try {
    // Get counts for each resource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();

    // Calculate total sales
    const totalSales = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    });

    // Get monthly sales
    const salesDataRaw = await prisma.$queryRaw<
      Array<{ month: string; totalSales: Prisma.Decimal }>
    >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

    const salesData: SalesDataType = salesDataRaw.map((entry) => ({
      month: entry.month,
      totalSales: Number(entry.totalSales), // Convert Decimal to number
    }));

    // Get latest sales
    const latestOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
      take: 6,
    });

    // Convert Decimal values to strings to avoid serialization issues
    const serializedLatestOrders = latestOrders.map((order) => ({
      ...order,
      itemsPrice: String(order.itemsPrice),
      shippingPrice: String(order.shippingPrice),
      taxPrice: String(order.taxPrice),
      totalPrice: String(order.totalPrice),
    }));

    return {
      ordersCount,
      productsCount,
      usersCount,
      totalSales: {
        _sum: {
          totalPrice: totalSales._sum.totalPrice
            ? String(totalSales._sum.totalPrice)
            : "0",
        },
      },
      latestOrders: serializedLatestOrders,
      salesData,
    };
  } catch (error) {
    console.error("Error getting order summary:", error);
    throw new Error(formatError(error));
  }
}

// Get All Orders (Admin)
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  try {
    // Build where conditions based on filters
    const where: Record<string, any> = {};

    // Add search if query is provided
    if (query) {
      where.OR = [
        {
          user: {
            name: {
              contains: query,
              mode: "insensitive", // Case-insensitive search
            },
          },
        },
        {
          id: {
            contains: query,
            mode: "insensitive", // Case-insensitive search
          },
        },
      ];
    }

    const data = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: { user: { select: { name: true } } },
    });

    const dataCount = await prisma.order.count({ where });

    // Convert Decimal objects to strings to avoid serialization issues
    const serializedData = data.map((order) => ({
      ...order,
      itemsPrice: String(order.itemsPrice),
      shippingPrice: String(order.shippingPrice),
      taxPrice: String(order.taxPrice),
      totalPrice: String(order.totalPrice),
    }));

    return {
      data: serializedData,
      totalPages: Math.ceil(dataCount / limit),
      currentPage: page,
      totalOrders: dataCount,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(formatError(error));
  }
}

// Delete Order (Admin)
export async function deleteOrder(orderId: string) {
  try {
    // Check if the order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Delete order items first (due to foreign key constraints)
    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Delete the order
    await prisma.order.delete({
      where: { id: orderId },
    });

    // Revalidate the admin orders page
    revalidatePath("/admin/orders");

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, message: formatError(error) };
  }
}

// Update Order To Paid By COD
export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Approve Paypal Order
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResultType)?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in paypal payment");

    // Update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Get User Orders
export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // Make sure we have a user ID
    if (!session.user?.id) throw new Error("User ID not found");

    // Get orders with pagination
    const data = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        orderItems: true,
      },
    });

    // Count total orders for pagination
    const dataCount = await prisma.order.count({
      where: { userId: session.user.id },
    });

    // Convert Decimal objects to strings to avoid serialization issues
    const serializedData = data.map((order) => ({
      ...order,
      itemsPrice: String(order.itemsPrice),
      shippingPrice: String(order.shippingPrice),
      taxPrice: String(order.taxPrice),
      totalPrice: String(order.totalPrice),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: String(item.price),
      })),
    }));

    return {
      data: serializedData,
      totalPages: Math.ceil(dataCount / limit),
      currentPage: page,
      totalOrders: dataCount,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error(formatError(error));
  }
}

// Update Order To Delivered
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);
    revalidatePath(`/admin/orders`);

    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
