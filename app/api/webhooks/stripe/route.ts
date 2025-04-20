import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateOrderToPaid } from "@/lib/actions/order.actions";

// We'll initialize Stripe inside the handler function to avoid build errors

// Define the POST handler function for the Stripe webhook
export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe with the secret API key from environment variables
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-03-31.basil", // Specify the Stripe API version
    });

    // Construct the event using the raw request body, the Stripe signature header, and the webhook secret.
    // This ensures that the request is indeed from Stripe and has not been tampered with.
    const event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    // charge.succeeded indicates a successful payment
    if (event.type === "charge.succeeded") {
      // Retrieve the order ID from the payment metadata
      const { object } = event.data;

      // Update the order status to paid
      await updateOrderToPaid({
        orderId: object.metadata.orderId,
        paymentResult: {
          id: object.id,
          status: "COMPLETED",
          email_address: object.billing_details.email!,
          pricePaid: (object.amount / 100).toFixed(2),
        },
      });

      return NextResponse.json({
        message: "updateOrderToPaid was successful",
      });
    }

    return NextResponse.json({
      message: "event is not charge.succeeded",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
