import React from 'react';
import { useGetMyReviewsQuery, useGetMyRatingsQuery, useDeleteReviewMutation, useDeleteRatingMutation } from '../../../store/apiSlice';
import { Icon } from '../../../components/Icon';
import { BackButton } from './SharedUI';
import { useApp } from '../../../context';

export function MyReviewsView({ goBack }) {
  const { showToast } = useApp();
  
  const { data: reviewsRes, isLoading: isLoadingReviews, refetch: refetchReviews } = useGetMyReviewsQuery();
  const { data: ratingsRes, isLoading: isLoadingRatings, refetch: refetchRatings } = useGetMyRatingsQuery();

  const [deleteReview] = useDeleteReviewMutation();
  const [deleteRating] = useDeleteRatingMutation();

  const reviews = Array.isArray(reviewsRes) ? reviewsRes : (reviewsRes?.data || []);
  const ratings = Array.isArray(ratingsRes) ? ratingsRes : (ratingsRes?.data || []);

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId).unwrap();
      showToast('Review deleted', { position: 'top' });
      refetchReviews();
    } catch {
      showToast('Failed to delete review', { position: 'top' });
    }
  };

  const handleDeleteRating = async (itemId) => {
    try {
      await deleteRating(itemId).unwrap();
      showToast('Rating removed', { position: 'top' });
      refetchRatings();
    } catch {
      showToast('Failed to remove rating', { position: 'top' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isLoading = isLoadingReviews || isLoadingRatings;

  return (
    <div>
      <BackButton onClick={goBack} label="My Reviews & Ratings" />

      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-slate-900">Your Feedback</h2>
        <p className="text-xs text-slate-500 font-medium">Manage ratings and comments you have submitted</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-100/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 && ratings.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center my-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Icon name="rate_review" size={28} />
          </div>
          <h3 className="font-extrabold text-slate-800 text-base mb-1">No reviews submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Reviews and star ratings you leave on lodges, vendors, or services will appear here for easy management.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Written Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((rev) => {
                  const revId = rev.id || rev._id;
                  return (
                    <div
                      key={revId}
                      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {rev.item?.name || 'Campus Listing'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            • {formatDate(rev.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(revId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border-none cursor-pointer"
                        title="Delete review"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ratings Section */}
          {ratings.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Star Ratings ({ratings.length})
              </h3>
              <div className="space-y-3">
                {ratings.map((rat) => {
                  const ratId = rat.id || rat._id;
                  return (
                    <div
                      key={ratId}
                      className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 text-amber-600 font-extrabold text-xs">
                          <Icon name="star" size={14} fill={1} />
                          <span>{rat.rating} / 5</span>
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {rat.item?.name || 'Campus Listing'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteRating(rat.itemId || rat.item?.id || rat.item?._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border-none cursor-pointer"
                        title="Remove rating"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
