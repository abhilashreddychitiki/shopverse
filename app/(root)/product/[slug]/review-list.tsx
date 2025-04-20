"use client";

import { useEffect, useState } from "react";
import { Review } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Check, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import ReviewForm from "./review-form";
import { getReviewsByProductId } from "@/lib/actions/review.actions";
import Rating from "@/components/shared/product/rating";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviewsByProductId(productId);
      if (response.success) {
        setReviews(response.data);
      } else {
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      toast.error("An error occurred while loading reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <>
          {reviews.length === 0 && <div>No reviews yet</div>}
          {userId ? (
            <ReviewForm
              userId={userId}
              productId={productId}
              onReviewSubmitted={handleReviewSubmitted}
            />
          ) : (
            <div>
              Please{" "}
              <Link
                className="text-primary px-2"
                href={`/api/auth/signin?callbackUrl=/product/${productSlug}`}
              >
                sign in
              </Link>{" "}
              to write a review
            </div>
          )}
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <div className="flex">
                      <Rating value={review.rating} />
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {review.user?.name || "Anonymous"}
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center text-green-600">
                        <Check className="h-4 w-4 mr-1" /> Verified Purchase
                      </span>
                    )}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(review.createdAt).dateTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{review.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewList;
