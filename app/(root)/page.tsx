import ProductList from "@/components/shared/product/product-list";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/view-all-products-button";
import IconBoxes from "@/components/icon-boxes";
import DealCountdown from "@/components/deal-countdown";
import {
  getFeaturedProducts,
  getLatestProducts,
} from "@/lib/actions/product.actions";
import { Product } from "@/types";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="space-y-8">
      {featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts as unknown as Product[]} />
      )}

      <DealCountdown />

      <IconBoxes />

      <ProductList
        title="Newest Arrivals"
        data={latestProducts as unknown as Product[]}
      />
      <ViewAllProductsButton />
    </div>
  );
};

export default HomePage;
