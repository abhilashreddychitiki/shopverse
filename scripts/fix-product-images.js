// This script will update product images to use local paths
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Local image paths for products
const productImages = {
  'polo-sporting-stretch-shirt': [
    '/images/sample-products/p1-1.jpg',
    '/images/sample-products/p1-2.jpg'
  ],
  'brooks-brothers-long-sleeved-shirt': [
    '/images/sample-products/p2-1.jpg',
    '/images/sample-products/p2-2.jpg'
  ],
  'tommy-hilfiger-classic-fit-dress-shirt': [
    '/images/sample-products/p3-1.jpg',
    '/images/sample-products/p3-2.jpg'
  ],
  'calvin-klein-slim-fit-stretch-shirt': [
    '/images/sample-products/p4-1.jpg',
    '/images/sample-products/p4-2.jpg'
  ],
  'polo-ralph-lauren-oxford-shirt': [
    '/images/sample-products/p5-1.jpg',
    '/images/sample-products/p5-2.jpg'
  ],
  'polo-classic-pink-hoodie': [
    '/images/sample-products/p6-1.jpg',
    '/images/sample-products/p6-2.jpg'
  ]
};

async function main() {
  try {
    // Update each product with local image paths
    for (const [slug, images] of Object.entries(productImages)) {
      // Update the product
      await prisma.product.updateMany({
        where: { slug },
        data: { images }
      });
      
      console.log(`Updated images for ${slug}`);
    }

    console.log('All products updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
