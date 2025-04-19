import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import { ShippingAddress } from "@/types";
import { Metadata } from "next";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
  title: "Order Details",
};

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  // Use the params directly to avoid Next.js warning
  const order = await getOrderById(params.id);
  if (!order) notFound();

  // Make sure PAYPAL_CLIENT_ID is set in your environment variables
  // For client-side usage, we need to use NEXT_PUBLIC_ prefix
  const paypalClientId =
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    process.env.PAYPAL_CLIENT_ID ||
    "sb";

  if (!paypalClientId) {
    console.error("PayPal client ID not configured");
    throw new Error("PayPal client ID not configured");
  }

  console.log("Using PayPal client ID:", paypalClientId);

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      paypalClientId={paypalClientId || "sb"}
    />
  );
};

export default OrderDetailsPage;
