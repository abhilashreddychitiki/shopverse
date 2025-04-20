"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Order, PaymentResult } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateOrderToPaidByCOD,
} from "@/lib/actions/order.actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import StripePayment from "./stripe-payment";

const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
  stripeClientSecret,
}: {
  order: Omit<Order, "paymentResult"> & { paymentResult?: PaymentResult };
  paypalClientId: string;
  isAdmin: boolean;
  stripeClientSecret: string | null;
}) => {
  const [isPending, startTransition] = useTransition();

  const {
    shippingAddress,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  // Creates a PayPal order
  const createOrder = async () => {
    try {
      console.log("Creating PayPal order for order ID:", order.id);
      const res = await createPayPalOrder(order.id);
      if (!res.success) {
        console.error("Failed to create PayPal order:", res.message);
        toast.error(res.message);
        throw new Error(res.message);
      }
      console.log("PayPal order created successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("Error creating PayPal order:", err);
      toast.error("Failed to create PayPal order");
      throw new Error("Failed to create PayPal order");
    }
  };

  // Handles PayPal order approval
  const onApprove = async (data: { orderID: string }) => {
    try {
      console.log("Approving PayPal order:", data);
      const res = await approvePayPalOrder(order.id, data);
      if (!res.success) {
        console.error("Failed to approve PayPal order:", res.message);
        toast.error(res.message);
        return;
      }
      console.log("PayPal order approved successfully");
      toast.success(res.message);
      // Refresh the page to show updated payment status
      window.location.reload();
    } catch (err) {
      console.error("Error approving PayPal order:", err);
      toast.error("Failed to process payment");
    }
  };

  // PayPal Buttons wrapper component with loading state
  const PayPalButtonsWrapper = ({
    createOrder,
    onApprove,
  }: {
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
  }) => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

    let loadingMessage = "";
    if (isPending) loadingMessage = "Loading PayPal...";
    if (isRejected) loadingMessage = "Error loading PayPal.";

    return (
      <>
        {loadingMessage && <div className="text-sm mb-2">{loadingMessage}</div>}
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect" }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            console.error("PayPal error:", err);
            toast.error("PayPal encountered an error. Please try again.");
          }}
        />
      </>
    );
  };

  // Button To mark the order as paid
  const MarkAsPaidButton = () => {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await updateOrderToPaidByCOD(order.id);
            if (res.success) {
              toast.success(res.message);
              // Refresh the page to show updated status
              window.location.reload();
            } else {
              toast.error(res.message);
            }
          })
        }
        className="w-full mt-4"
      >
        {isPending ? "Processing..." : "Mark As Paid"}
      </Button>
    );
  };

  // Button To mark the order as delivered
  const MarkAsDeliveredButton = () => {
    return (
      <Button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await deliverOrder(order.id);
            if (res.success) {
              toast.success(res.message);
              // Refresh the page to show updated status
              window.location.reload();
            } else {
              toast.error(res.message);
            }
          })
        }
        className="w-full mt-4"
      >
        {isPending ? "Processing..." : "Mark As Delivered"}
      </Button>
    );
  };

  return (
    <>
      <h1 className="py-4 text-2xl"> Order {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant="secondary">
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not paid</Badge>
              )}

              {/* PayPal Payment */}
              {!isPaid && paymentMethod === "PayPal" && (
                <div className="mt-4">
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: "USD",
                      intent: "capture",
                      components: "buttons",
                      disableFunding: "credit,card",
                    }}
                  >
                    <PayPalButtonsWrapper
                      createOrder={createOrder}
                      onApprove={onApprove}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              {/* Stripe Payment */}
              {!isPaid && paymentMethod === "Stripe" && stripeClientSecret && (
                <StripePayment
                  priceInCents={Math.round(Number(order.totalPrice) * 100)}
                  orderId={order.id}
                  clientSecret={stripeClientSecret}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city},{" "}
                {shippingAddress.postalCode}, {shippingAddress.country}{" "}
              </p>
              {isDelivered ? (
                <Badge variant="secondary">
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant="destructive">Not delivered</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-4 space-y-4 gap-4">
              <h2 className="text-xl pb-4">Order Summary</h2>
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>

              {/* Admin Actions */}
              {isAdmin &&
                !isPaid &&
                (paymentMethod === "COD" ||
                  paymentMethod === "CashOnDelivery") && <MarkAsPaidButton />}

              {isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
