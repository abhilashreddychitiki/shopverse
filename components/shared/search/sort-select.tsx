'use client';

import { useRouter } from 'next/navigation';

interface SortSelectProps {
  sort: string;
  getFilterUrl: (params: { s?: string }) => string;
}

const SortSelect = ({ sort, getFilterUrl }: SortSelectProps) => {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(getFilterUrl({ s: e.target.value }));
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

export default SortSelect;
