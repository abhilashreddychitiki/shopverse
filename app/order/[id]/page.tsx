import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import Stripe from "stripe";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }

  const params = await props.params;
  const order = await getOrderById(params.id);

  let client_secret = null;

  // Check if using Stripe and not paid
  if (order && order.paymentMethod === "Stripe" && !order.isPaid) {
    // Initialize Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-03-31.basil", // Specify the Stripe API version
    });
    // Create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id },
    });
    client_secret = paymentIntent.client_secret;
  }
  if (!order) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Order not found</h1>
          <p className="mt-2">The order you are looking for does not exist.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-500 hover:underline"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="container mx-auto py-8">
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as {
            country: string;
            fullName: string;
            streetAddress: string;
            city: string;
            postalCode: string;
            lat?: number;
            lng?: number;
          },
        }}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        stripeClientSecret={client_secret}
        isAdmin={isAdmin}
      />
    </div>
  );
}
