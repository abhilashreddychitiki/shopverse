// This script will create products with uploaded images
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Product data
const products = [
  {
    name: "Polo Sporting Stretch Shirt",
    slug: "polo-sporting-stretch-shirt",
    category: "Mens Dress Shirts",
    description: "Classic Polo style with modern comfort",
    price: "59.99",
    brand: "Polo",
    stock: 500,
    images: [
      "/images/sample-products/p1-1.jpg",
      "/images/sample-products/p1-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  },
  {
    name: "Brooks Brothers Long Sleeved Shirt",
    slug: "brooks-brothers-long-sleeved-shirt",
    category: "Mens Dress Shirts",
    description: "Timeless style and premium comfort",
    price: "85.99",
    brand: "Brooks Brothers",
    stock: 500,
    images: [
      "/images/sample-products/p2-1.jpg",
      "/images/sample-products/p2-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  },
  {
    name: "Tommy Hilfiger Classic Fit Dress Shirt",
    slug: "tommy-hilfiger-classic-fit-dress-shirt",
    category: "Mens Dress Shirts",
    description: "A perfect blend of sophistication and comfort",
    price: "99.95",
    brand: "Tommy Hilfiger",
    stock: 500,
    images: [
      "/images/sample-products/p3-1.jpg",
      "/images/sample-products/p3-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  },
  {
    name: "Calvin Klein Slim Fit Stretch Shirt",
    slug: "calvin-klein-slim-fit-stretch-shirt",
    category: "Mens Dress Shirts",
    description: "Streamlined design with flexible stretch fabric",
    price: "99.95",
    brand: "Calvin Klein",
    stock: 500,
    images: [
      "/images/sample-products/p4-1.jpg",
      "/images/sample-products/p4-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  },
  {
    name: "Polo Ralph Lauren Oxford Shirt",
    slug: "polo-ralph-lauren-oxford-shirt",
    category: "Mens Dress Shirts",
    description: "Iconic Polo design with refined oxford fabric",
    price: "79.99",
    brand: "Polo",
    stock: 0,
    images: [
      "/images/sample-products/p5-1.jpg",
      "/images/sample-products/p5-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  },
  {
    name: "Polo Classic Pink Hoodie",
    slug: "polo-classic-pink-hoodie",
    category: "Mens Sweatshirts",
    description: "Soft, stylish, and perfect for laid-back days",
    price: "99.99",
    brand: "Polo",
    stock: 500,
    images: [
      "/images/sample-products/p6-1.jpg",
      "/images/sample-products/p6-2.jpg"
    ],
    isFeatured: false,
    banner: null,
    rating: 0,
    numReviews: 0
  }
];

async function main() {
  try {
    // First, delete all existing products
    console.log('Deleting existing products...');
    await prisma.product.deleteMany({});
    console.log('All products deleted successfully');

    // Create new products
    console.log('Creating new products...');
    for (const product of products) {
      await prisma.product.create({
        data: product
      });
      console.log(`Created product: ${product.name}`);
    }

    console.log('All products created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
