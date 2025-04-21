"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SortDropdownProps {
  sort: string;
  q: string;
  category: string;
  price: string;
  rating: string;
  page: string;
}

const SortDropdown = ({
  sort,
  q,
  category,
  price,
  rating,
  page,
}: SortDropdownProps) => {
  const router = useRouter();

  const handleValueChange = (value: string) => {
    const params = { q, category, price, rating, sort: value, page };
    const url = `/search?${new URLSearchParams(params).toString()}`;
    router.push(url);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Sort by</span>
      <Select value={sort} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest Arrivals</SelectItem>
          <SelectItem value="lowest">Price: Low to High</SelectItem>
          <SelectItem value="highest">Price: High to Low</SelectItem>
          <SelectItem value="rating">Customer Reviews</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
