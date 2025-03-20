import React, { useState } from "react";
import { AppDispatch } from "@/reducers/store";
import { useDispatch } from "react-redux";
import { addReview } from "@/reducers/reviewSlice";
import ReviewForm from "@/components/forms/ReviewForm";
import { AddReviewProps } from '../../../types/types';

const AddReview: React.FC<AddReviewProps> = ({ storeId }) => {
  const dispatch: AppDispatch = useDispatch();
    try {
      await dispatch(addReview({ storeId, reviewData: data }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ReviewForm
        initialData={{ rating: 0, comment: "" }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit({ rating: 0, comment: "" });
        }}
      >
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default AddReview;
