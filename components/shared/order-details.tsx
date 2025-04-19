"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  approvePayPalOrder,
  deliverOrder,
  updateOrderToPaidByCOD,
} from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";

type OrderDetailsProps = {
  order: any;
  isAdmin: boolean;
};

export default function OrderDetails({ order, isAdmin }: OrderDetailsProps) {
  const [isPending, startTransition] = useTransition();
  // Using sonner toast

  // Button To mark the order as paid
  const handleMarkAsPaid = async () => {
    startTransition(async () => {
      const res = await updateOrderToPaidByCOD(order.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  // Button To mark the order as delivered
  const handleMarkAsDelivered = async () => {
    startTransition(async () => {
      const res = await deliverOrder(order.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Order Info */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {order.shippingAddress.fullName}
            </p>
            <p>
              <strong>Address:</strong> {order.shippingAddress.streetAddress},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </p>
            <div className="mt-2">
              <strong>Status:</strong>{" "}
              {order.isDelivered ? (
                <span className="text-green-500">
                  Delivered on {formatDateTime(order.deliveredAt).dateTime}
                </span>
              ) : (
                <span className="text-red-500">Not delivered</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Method:</strong> {order.paymentMethod}
            </p>
            <div className="mt-2">
              <strong>Status:</strong>{" "}
              {order.isPaid ? (
                <span className="text-green-500">
                  Paid on {formatDateTime(order.paidAt).dateTime}
                </span>
              ) : (
                <span className="text-red-500">Not paid</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <div className="w-16 h-16 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <div className="text-right">
                    {item.qty} x {formatCurrency(item.price)} ={" "}
                    {formatCurrency(Number(item.price) * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <div className="mt-4 space-y-2">
              {!order.isPaid &&
                (order.paymentMethod === "COD" ||
                  order.paymentMethod === "CashOnDelivery") && (
                  <Button
                    onClick={handleMarkAsPaid}
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending
                      ? "Processing..."
                      : "Mark as Paid (Cash on Delivery)"}
                  </Button>
                )}

              {order.isPaid && !order.isDelivered && (
                <Button
                  onClick={handleMarkAsDelivered}
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? "Processing..." : "Mark as Delivered"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
