'use client';

import { useRouter } from 'next/navigation';

interface SortOptionsProps {
  sort: string;
  q: string;
  category: string;
  price: string;
  rating: string;
  page: string;
}

const SortOptions = ({ sort, q, category, price, rating, page }: SortOptionsProps) => {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = { q, category, price, rating, sort: e.target.value, page };
    const url = `/search?${new URLSearchParams(params).toString()}`;
    router.push(url);
  };

  return (
    <div>
      Sort by{' '}
      <select value={sort} onChange={handleChange}>
        <option value="newest">Newest Arrivals</option>
        <option value="lowest">Price: Low to High</option>
        <option value="highest">Price: High to Low</option>
        <option value="toprated">Customer Reviews</option>
      </select>
    </div>
  );
};

export default SortOptions;
