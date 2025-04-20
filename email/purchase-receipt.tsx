import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
// Import formatCurrency directly to avoid module resolution issues
const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
};

// Import only the types we need
import type { Order } from "@/types";

type OrderInformationProps = {
  order: Order;
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function PurchaseReceiptEmail({ order }: { order: Order }) {
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    Purchased On
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderItems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20">
                    <Img
                      width="80"
                      alt={item.name}
                      className="rounded"
                      src={
                        item.image.startsWith("/")
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className="align-top">
                    <Text className="mx-2 my-0">
                      {item.name} x {item.qty}
                    </Text>
                  </Column>
                  <Column align="right" className="align-top">
                    <Text className="m-0 ">{formatCurrency(item.price)}</Text>
                  </Column>
                </Row>
              ))}
              {[
                { name: "Items", price: order.itemsPrice },
                { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice },
                { name: "Total", price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}:</Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Preview props for testing the email template
PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: "123456789",
    userId: "123",
    user: {
      name: "John Doe",
      email: "example@example.com",
    },
    paymentMethod: "Stripe",
    shippingAddress: {
      fullName: "John Doe",
      streetAddress: "123 Main St",
      city: "New York",
      postalCode: "10001",
      country: "US",
    },
    createdAt: new Date(),
    totalPrice: "100",
    taxPrice: "10",
    shippingPrice: "10",
    itemsPrice: "80",
    orderItems: [
      {
        name: "Sample Product 1",
        orderId: "123",
        productId: "123",
        slug: "sample-product-1",
        qty: 2,
        image: "/images/sample-product-1.jpg",
        price: "29.99",
      },
      {
        name: "Sample Product 2",
        orderId: "123",
        productId: "456",
        slug: "sample-product-2",
        qty: 1,
        image: "/images/sample-product-2.jpg",
        price: "49.99",
      },
    ],
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    paymentResult: {
      id: "123",
      status: "succeeded",
      pricePaid: "12",
      email_address: "example@example.com",
    },
  },
} satisfies OrderInformationProps;
