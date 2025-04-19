import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }

  const order = await getOrderById(params.id);
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
        order={order}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
        isAdmin={isAdmin}
      />
    </div>
  );
}
