import { PrismaClient } from "../lib/generated/prisma";
import sampleData from "./sample-data";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Deleting existing products...");
    await prisma.product.deleteMany();

    console.log("Seeding products...");
    // Prisma will handle the conversion to Decimal
    await prisma.product.createMany({
      data: sampleData.products,
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in seed script:", error);
    process.exit(1);
  });
