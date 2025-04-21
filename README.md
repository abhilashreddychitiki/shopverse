# Shopverse - Modern E-commerce Platform

Shopverse is a full-featured e-commerce platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. It offers a comprehensive set of features for both customers and administrators, with a focus on performance, usability, and modern design.

## 🔗 Live Demo

**[View Live Demo](https://shopverse-seven.vercel.app/)** - Deployed on Vercel

<!-- Replace this with an actual screenshot of your carousel -->

![Shopverse Carousel](./public/images/carousel.png)

> Note: The demo showcases the product carousel, dynamic product listings, theme switching, and full e-commerce functionality. For the best experience, visit the [live demo](https://shopverse-seven.vercel.app/).

## 🌟 Features

### 🛍️ Customer Features

- **User Authentication**

  - Email/password registration and login
  - Google OAuth integration
  - JWT-based session management
  - User profile management

- **Product Browsing**

  - Featured products carousel with autoplay functionality
  - Interactive product sliders with smooth animations
  - Category filtering with dropdown and sidebar options
  - Price range filtering with slider controls
  - Rating-based filtering
  - Advanced search functionality with multiple parameters
  - Responsive product grid layout

- **Shopping Experience**

  - Add to cart functionality
  - Cart management (add, remove, update quantities)
  - Guest cart that transfers to user account upon login
  - Persistent cart across sessions

- **Checkout Process**

  - Shipping address management
  - Multiple payment methods:
    - PayPal integration
    - Stripe integration
    - Cash on Delivery option
  - Order confirmation and email receipts

- **Order Management**

  - Order history
  - Order status tracking
  - Order details view

- **Product Reviews**
  - Rating system
  - Review submission
  - Verified purchase badges

### 👨‍💼 Admin Features

- **Dashboard**

  - Sales overview
  - Revenue statistics
  - Customer metrics
  - Product metrics
  - Interactive charts with Recharts

- **Product Management**

  - Add, edit, and delete products
  - Manage product categories
  - Set featured products with banner images
  - Image uploads via UploadThing

- **Order Management**

  - View all orders
  - Update order status (paid, delivered)
  - Delete orders

- **User Management**
  - View all users
  - Edit user roles
  - User search functionality

### 🎨 UI/UX Features

- **Responsive Design**

  - Mobile-first approach
  - Adapts to all screen sizes
  - Optimized for touch devices

- **Theme Support**

  - Light and dark mode
  - System preference detection
  - Persistent theme selection

- **Modern UI Components**
  - Built with ShadCN UI
  - Custom styling with Tailwind CSS
  - Smooth animations and transitions

## 🛠️ Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **ShadCN UI**: Component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Chart visualization
- **Next-themes**: Theme management
- **Sonner**: Toast notifications

### Backend

- **Next.js API Routes**: Server-side logic
- **NextAuth.js**: Authentication
- **Prisma ORM**: Database access
- **PostgreSQL**: Database
- **Neon**: Serverless Postgres provider
- **Resend**: Email service
- **React Email**: Email templates

### Payment Processing

- **Stripe**: Credit card processing
- **PayPal**: Alternative payment method

### File Storage

- **UploadThing**: Image upload and storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (or access to a PostgreSQL database)

## 🚀 Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/abhilashreddychitiki/shopverse.git
   cd shopverse
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/shopverse"
   SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/shopverse_shadow"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   STRIPE_SECRET_KEY="your-stripe-secret-key"

   # PayPal
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
   PAYPAL_API_URL="https://api-m.sandbox.paypal.com"

   # UploadThing
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"

   # Resend (Email)
   RESEND_API_KEY="your-resend-api-key"
   SENDER_EMAIL="your-sender-email"

   # App Configuration
   NEXT_PUBLIC_APP_NAME="Shopverse"
   NEXT_PUBLIC_APP_DESCRIPTION="A modern e-commerce platform"
   NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
   USER_ROLES="admin, user"
   ```

4. Initialize the database:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database (optional):

   ```bash
   npm run seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
shopverse/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (root)/             # Main application routes
│   ├── admin/              # Admin dashboard routes
│   ├── api/                # API routes
│   └── user/               # User account routes
├── assets/                 # Static assets
├── components/             # React components
│   ├── shared/             # Shared components
│   ├── ui/                 # UI components (ShadCN)
│   └── ...                 # Feature-specific components
├── db/                     # Database configuration
├── email/                  # Email templates
├── lib/                    # Utility functions and libraries
│   ├── actions/            # Server actions
│   ├── constants/          # Constants and default values
│   ├── utils/              # Utility functions
│   └── validator.ts        # Zod validation schemas
├── prisma/                 # Prisma schema and migrations
├── public/                 # Public assets
└── types/                  # TypeScript type definitions
```

## 🔒 Authentication

Shopverse uses NextAuth.js for authentication with the following providers:

- Email/Password (credentials)
- Google OAuth

User roles are supported with two default roles:

- `user`: Regular customer
- `admin`: Administrator with access to the admin dashboard

## 💳 Payment Processing

The application supports multiple payment methods:

- **PayPal**: Full integration with PayPal API
- **Stripe**: Integration with Stripe Elements and Payment Intents
- **Cash on Delivery**: Simple option for pay-on-delivery

## 📧 Email Functionality

Shopverse uses Resend with React Email for sending:

- Order confirmations
- Payment receipts
- Account notifications

## 🎨 Theming

The application supports light and dark modes using next-themes:

- System preference detection
- Manual theme selection
- Persistent theme preference

## 🔄 State Management

- **Server Components**: For data fetching and initial state
- **React Hooks**: For client-side state management
- **Form State**: Managed with React Hook Form
- **Validation**: Handled with Zod schemas

## 📱 Responsive Design

The application is fully responsive and works on:

- Mobile devices
- Tablets
- Desktop computers

## 🚀 Deployment

The application is deployed on Vercel. You can deploy your own instance to:

- [Vercel](https://vercel.com) (recommended and currently used for the [live demo](https://shopverse-seven.vercel.app/))
- Netlify
- Any platform supporting Next.js

To deploy to Vercel, simply push your repository to GitHub and import it in the Vercel dashboard.

## 🧪 Testing

Run tests with:

```bash
npm run test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [UploadThing](https://uploadthing.com/)
- [Stripe](https://stripe.com/)
- [PayPal](https://developer.paypal.com/)
- [Resend](https://resend.com/)
