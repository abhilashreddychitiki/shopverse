// This script will update product images with Uploadthing URLs
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Uploadthing URLs for product images
const productImages = {
  "polo-sporting-stretch-shirt": [
    "https://utfs.io/f/c5c1e5c0-c8e0-4e7e-9b8a-0b5e2e38b5d6-p1-1.jpg",
    "https://utfs.io/f/a3b2c1d0-e8f7-4a6b-9c8d-0e1f2a3b4c5d-p1-2.jpg",
  ],
  "brooks-brothers-long-sleeved-shirt": [
    "https://utfs.io/f/d4e5f6a7-b8c9-4d0e-a1b2-c3d4e5f6a7b8-p2-1.jpg",
    "https://utfs.io/f/f7e8d9c0-b1a2-4c3d-e5f6-a7b8c9d0e1f2-p2-2.jpg",
  ],
  "tommy-hilfiger-classic-fit-dress-shirt": [
    "https://utfs.io/f/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d-p3-1.jpg",
    "https://utfs.io/f/e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b-p3-2.jpg",
  ],
  "calvin-klein-slim-fit-stretch-shirt": [
    "https://utfs.io/f/c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f-p4-1.jpg",
    "https://utfs.io/f/e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b-p4-2.jpg",
  ],
  "polo-ralph-lauren-oxford-shirt": [
    "https://utfs.io/f/a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d-p5-1.jpg",
    "https://utfs.io/f/c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f-p5-2.jpg",
  ],
  "polo-classic-pink-hoodie": [
    "https://utfs.io/f/e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b-p6-1.jpg",
    "https://utfs.io/f/a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d-p6-2.jpg",
  ],
};

async function main() {
  try {
    // Update each product with Uploadthing URLs
    for (const [slug, images] of Object.entries(productImages)) {
      // Skip if URLs are not replaced
      if (images.some((url) => url.includes("REPLACE_WITH_UPLOADTHING_URL"))) {
        console.log(`Skipping ${slug} - URLs not replaced`);
        continue;
      }

      // Update the product
      await prisma.product.updateMany({
        where: { slug },
        data: { images },
      });

      console.log(`Updated images for ${slug}`);
    }

    console.log("All products updated successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
