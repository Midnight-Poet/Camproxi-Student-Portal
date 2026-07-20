import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { ALL_ITEMS, fmt, getPrice } from '../data.js'; // Fallback
import { PlaceholderImg } from '../components/PlaceholderImg.jsx';
import { Badge } from '../components/Badge.jsx';
import { Icon } from '../components/Icon.jsx';
import { 
  useGetSavedItemsQuery,
  useSaveItemMutation,
  useRemoveSavedItemMutation,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetProductByIdQuery,
  useGetPropertyByIdQuery,
  useGetServiceByIdQuery,
  useGetUserByIdQuery,
  useAddReviewMutation,
  useAddRatingMutation,
  useCreateRequestMutation,
} from '../store/apiSlice';

const LODGE_AMENITIES = ['WiFi', 'Water', 'Security', '24h Power', 'Parking', 'Kitchen'];
const AMENITY_ICONS = { 
  'WiFi': 'wifi', 'Water': 'water_drop', 'Security': 'security', 
  '24h Power': 'bolt', 'Parking': 'local_parking', 'Kitchen': 'kitchen',
  'default': 'check_circle'
};

function normalizeItem(item, kind, defaultCategory) {
  const ratings = item.ratings || [];
  const totalReviews = ratings.length > 0 ? ratings.length : (item.totalReviews || 0);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : (item.averageRating !== undefined ? item.averageRating : (item.rating || 0));

  return {
    id: item.id || item._id,
    name: item.name || item.title || 'Unknown Listing',
    cat: item.category || defaultCategory,
    kind: kind,
    type: item.type || item.roomType || item.businessCategory || item.serviceCategory || defaultCategory,
    rating: averageRating,
    totalReviews: totalReviews,
    dist: item.dist || '0.5 km',
    badge: item.badge || (kind === 'lodge' ? 'Available' : 'Open'),
    label: item.label || '',
    price: item.price || 0,
    unit: item.unit || (kind === 'lodge' ? '/year' : ''),
    ...item // Keep all original properties like amenities, images, delivery, availableDays, etc.
  };
}

// Maps item kind to the API's itemCategory enum values
const ITEM_CATEGORY_MAP = { lodge: 'PROPERTY', product: 'PRODUCT', service: 'SERVICE' };

export function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch, showToast } = useApp();

  // Try to fetch each item type by ID directly (most efficient path)
  // Skip queries until we know which type the item is OR fall through to list-based lookup
  const { data: productById, isLoading: isLoadingProductById, refetch: refetchProduct } = useGetProductByIdQuery(id);
  const { data: propertyById, isLoading: isLoadingPropertyById, refetch: refetchProperty } = useGetPropertyByIdQuery(id);
  const { data: serviceById, isLoading: isLoadingServiceById, refetch: refetchService } = useGetServiceByIdQuery(id);

  // Also fetch all lists for fallback (cached from Home/Explore, essentially free)
  const { data: productsRes } = useGetProductsQuery();
  const { data: propertiesRes } = useGetPropertiesQuery();
  const { data: servicesRes } = useGetServicesQuery();

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);

  // Prefer the direct-by-ID response, fall back to list search, then static mock
  const itemFromById =
    (productById && normalizeItem(productById?.data || productById, 'vendor', 'vendor')) ||
    (propertyById && normalizeItem(propertyById?.data || propertyById, 'lodge', 'Lodges')) ||
    (serviceById && normalizeItem(serviceById?.data || serviceById, 'service', 'Services'));

  const combinedItems = [
    ...rawProperties.map(p => normalizeItem(p, 'lodge', 'Lodges')),
    ...rawProducts.map(p => normalizeItem(p, 'vendor', 'vendor')),
    ...rawServices.map(p => normalizeItem(p, 'service', 'Services')),
  ];
  const displayItems = combinedItems.length > 0 ? combinedItems : ALL_ITEMS;
  const itemFromList = displayItems.find(i => i.id === id);

  const item = itemFromById || itemFromList;
  // Show spinner while ANY of the three by-ID queries is still in flight AND we haven't found the item yet.
  // Using OR (not AND) is critical: with AND, the moment any one query 404s, isLoading becomes false
  // even though the correct query is still pending — causing a premature "not found" flash.
  const isAnyLoading = isLoadingProductById || isLoadingPropertyById || isLoadingServiceById;
  const isLoadingItems = isAnyLoading && !item;

  // Fetch Saved state
  const { data: savedItemsRes } = useGetSavedItemsQuery();
  const rawSaved = Array.isArray(savedItemsRes) ? savedItemsRes : (savedItemsRes?.data || []);

  // FIX #7: API returns `itemId`, not `item`
  const savedRecord = rawSaved.find(s => s.itemId === id);
  const isSaved = !!savedRecord;

  const [saveItem, { isLoading: isSaving }] = useSaveItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveSavedItemMutation();
  const [addReview, { isLoading: isSubmittingReview }] = useAddReviewMutation();
  const [addRating, { isLoading: isSubmittingRating }] = useAddRatingMutation();
  const [createRequest, { isLoading: isRequesting }] = useCreateRequestMutation();
  const isMutating = isSaving || isRemoving;

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const reviewsWithComments = item?.reviews?.filter(r => r.comment && r.comment.trim() !== '') || [];

  // Resolve the agent/provider's real name via GET /users/:id
  const agentId = item?.agentId;
  const { data: agentRes } = useGetUserByIdQuery(agentId, { skip: !agentId });  
  const agentData = agentRes?.data || agentRes;

  if (isLoadingItems) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-cx-border border-t-cx-teal rounded-full animate-spin"></div>
        <p className="text-cx-muted mt-3 font-semibold">Loading listing...</p>
      </div>
    );
  }

  // Only show "not found" once every query has settled and item is still missing
  if (!item && !isAnyLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Icon name="error_outline" size={40} style={{ color: '#9aa0ab' }} />
        <p className="text-cx-muted mt-3 font-semibold">Listing not found</p>
        <button onClick={() => navigate('/explore')} className="mt-4 text-cx-teal text-sm font-semibold border-none bg-transparent cursor-pointer">
          Back to explore
        </button>
      </div>
    );
  }

  const price = getPrice(item);
  const itemImages = item.images && item.images.length > 0 ? item.images : null;
  const amenities = item.amenities && item.amenities.length > 0 ? item.amenities : LODGE_AMENITIES;
  
  // Provider name: resolved from GET /users/:agentId, falls back to a short ID label
  const agentFullName = agentData
    ? `${agentData.firstName || ''} ${agentData.lastName || ''}`.trim()
    : null;
  const providerName = item.kind === 'lodge'
    ? (agentFullName || `Agent ${String(item.agentId || '').slice(-4) || '—'}`)
    : item.name;
  const providerImage = agentData?.profileImage?.url || null;

  async function handleSave() {
    if (isMutating) return;
    try {
      if (isSaved) {
        // FIX #9: use `savedRecord.id` (API returns `id`, not `_id`)
        await removeItem(savedRecord.id).unwrap();
        showToast('Removed from saved');
      } else {
        // FIX #8: API expects `itemId` + `itemCategory` (UPPERCASE enum)
        await saveItem({
          itemId: item.id,
          itemCategory: ITEM_CATEGORY_MAP[item.kind] || 'PRODUCT',
        }).unwrap();
        showToast('Saved to your items');
      }
    } catch (err) {
      console.error('Failed to toggle save', err);
      showToast('Failed to save. Please try again.');
    }
  }

  async function handleCTA() {
    if (isRequesting) return;
    try {
      await createRequest({
        itemId: item.id,
        itemName: item.name,
        itemCategory: ITEM_CATEGORY_MAP[item.kind] || 'PRODUCT',
        message: 'I am interested in this listing.',
      }).unwrap();
      showToast(item.kind === 'lodge' ? 'Interest sent!' : 'Order interest sent!');
    } catch (err) {
      console.error('Failed to send request', err);
      showToast(err?.data?.message || 'Failed to send request. Try again.');
    }
  }

  async function handleRatingClick(star) {
    setReviewRating(star);
    try {
      await addRating({
        itemId: item.id,
        itemCategory: ITEM_CATEGORY_MAP[item.kind] || 'PRODUCT',
        rating: star,
      }).unwrap();
      showToast('Rating submitted');
      if (item.kind === 'product') refetchProduct();
      if (item.kind === 'lodge') refetchProperty();
      if (item.kind === 'service') refetchService();
    } catch (err) {
      console.error('Failed to submit rating', err);
      showToast(err?.data?.message || 'Failed to submit rating');
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please write a comment');
      return;
    }
    try {
      await addReview({
        itemId: item.id,
        itemCategory: ITEM_CATEGORY_MAP[item.kind] || 'PRODUCT',
        comment: reviewComment,
      }).unwrap();
      showToast('Review submitted successfully');
      setReviewComment('');
      // Refetch the current item so the new review appears
      if (item.kind === 'product') refetchProduct();
      if (item.kind === 'lodge') refetchProperty();
      if (item.kind === 'service') refetchService();
    } catch (err) {
      console.error('Failed to submit review', err);
      showToast(err?.data?.message || 'Failed to submit review');
    }
  }

  function handleMessage() {
    dispatch({
      type: 'OPEN_CHAT_WITH',
      name: providerName,
      listing: item.name,
      kind: item.kind,
    });
    navigate('/messages');
  }

  const ctaLabel = item.kind === 'lodge' ? 'Show Interest' : 'Order Now';

  // Helper renderer for images
  const renderHeroImage = () => {
    if (itemImages) {
      return <img src={itemImages[0].url} alt={item.name} className="w-full h-full object-cover" />;
    }
    return <PlaceholderImg label={item.label} style={{ width: '100%', height: '100%' }} />;
  };

  return (
    <div>
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Hero image */}
        <div className="relative -mx-4 -mt-4 h-[252px]">
          {renderHeroImage()}
          {/* Overlay buttons */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow border-none cursor-pointer hover:bg-white"
          >
            <Icon name="arrow_back" size={20} style={{ color: '#1f2430' }} />
          </button>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow border-none cursor-pointer hover:bg-white"
            >
              <Icon name="share" size={18} style={{ color: '#1f2430' }} />
            </button>
            <button
              onClick={handleSave}
              disabled={isMutating}
              className={`w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow border-none cursor-pointer hover:bg-white ${isMutating ? 'opacity-50' : ''}`}
            >
              {isMutating ? (
                <div className="w-4 h-4 border-2 border-cx-border border-t-cx-teal rounded-full animate-spin"></div>
              ) : (
                <Icon name="favorite" size={18} fill={isSaved ? 1 : 0} style={{ color: isSaved ? '#d05a5a' : '#1f2430' }} />
              )}
            </button>
          </div>
          <div className="absolute bottom-4 left-4">
            <Badge text={item.badge} />
          </div>
          <div className="absolute bottom-4 right-4 bg-black/50 px-2 py-1 rounded-full">
            <span className="text-white text-[11px] font-semibold">1 / {itemImages ? itemImages.length : 4}</span>
          </div>
        </div>

        {/* Gallery thumbnails */}
        <div className="flex gap-2 mt-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {itemImages ? (
            itemImages.slice(1).map((img, i) => (
              <img key={i} src={img.url} alt="Gallery" className="flex-none rounded-xl w-20 h-14 object-cover" />
            ))
          ) : (
            [0,1,2,3].map(i => (
              <PlaceholderImg
                key={i}
                label=""
                className="flex-none rounded-xl w-20"
                style={{ height: 56, opacity: i === 0 ? 1 : 0.6 }}
              />
            ))
          )}
        </div>

        {/* Info */}
        <h1 className="text-xl font-extrabold text-cx-ink mb-1">{item.name}</h1>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="location_on" size={14} fill={1} style={{ color: '#9aa0ab' }} />
          <span className="text-xs text-cx-muted">{item.dist} from campus</span>
          {item.totalReviews > 0 && (
            <>
              <span className="text-cx-muted">·</span>
              <Icon name="star" size={13} fill={1} style={{ color: '#f6a623' }} />
              <span className="text-xs font-bold text-cx-ink3">{Number(item.rating).toFixed(1)}</span>
              <span className="text-[10px] text-cx-muted">({item.totalReviews})</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-extrabold text-cx-teal">{price.text}</span>
          {price.sub && <span className="text-xs text-cx-muted">{price.sub}</span>}
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="font-bold text-cx-ink mb-2">About this {item.kind === 'lodge' ? 'lodge' : 'listing'}</h2>
          <p className="text-sm text-cx-ink4 leading-relaxed whitespace-pre-wrap">
            {item.description || (item.kind === 'lodge'
              ? `A well-maintained ${item.type.toLowerCase()} located just ${item.dist} from campus. Perfect for students seeking comfort and convenience.`
              : `${item.name} offers quality ${item.type.toLowerCase()} services for students. Conveniently located just ${item.dist} away.`)}
          </p>
        </div>

        {/* Dynamic Section based on kind */}
        {item.kind === 'lodge' && (
          <div className="mb-5">
            <h2 className="font-bold text-cx-ink mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <div key={a} className="flex items-center gap-1.5 bg-cx-teal-l px-3 py-1.5 rounded-full">
                  <Icon name={AMENITY_ICONS[a] || AMENITY_ICONS['default']} size={14} fill={1} style={{ color: '#14b8a6' }} />
                  <span className="text-xs font-semibold text-cx-teal">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {item.kind === 'product' && item.delivery && (
          <div className="mb-5">
            <h2 className="font-bold text-cx-ink mb-3">Delivery Options</h2>
            <div className="bg-white rounded-xl px-4 py-3 border border-cx-border flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-cx-ink">{item.delivery.option}</span>
                <span className="text-xs text-cx-muted">Estimated: {item.delivery.duration} mins</span>
              </div>
              <span className="text-sm font-bold text-cx-teal">{item.delivery.price > 0 ? fmt(item.delivery.price) : 'Free'}</span>
            </div>
          </div>
        )}

        {item.kind === 'service' && item.availableDays && (
          <div className="mb-5">
            <h2 className="font-bold text-cx-ink mb-3">Availability</h2>
            <div className="bg-white rounded-xl px-4 py-3 border border-cx-border flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-cx-ink">{item.availableDays.join(', ')}</span>
                <span className="text-xs text-cx-muted">{item.time?.startTime} - {item.time?.endTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Provider card */}
        <div className="bg-white rounded-2xl border border-cx-border p-4 flex items-center gap-3 mb-24">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-none"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
          >
            {providerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-bold text-cx-ink text-sm truncate">{providerName}</p>
              <Icon name="verified" size={14} fill={1} style={{ color: '#14b8a6' }} />
            </div>
            <p className="text-xs text-cx-muted truncate">{item.kind === 'lodge' ? 'Verified Agent' : 'Verified Vendor'}</p>
          </div>
          <button
            onClick={handleMessage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cx-teal-b text-cx-teal text-xs font-semibold cursor-pointer"
            style={{ background: '#e2f7f3' }}
          >
            <Icon name="chat_bubble" size={14} />
            Message
          </button>
        </div>

        {/* Reviews Section (Mobile) */}
        <div className="mb-24">
          <h2 className="font-bold text-cx-ink mb-4">Reviews & Ratings</h2>
          
          {/* Submit Review Form */}
          <div className="bg-gradient-to-b from-[#f8fafc] to-white rounded-3xl p-5 mb-6 shadow-sm border border-cx-border">
            <h3 className="text-lg font-bold text-cx-ink mb-1">Share your experience</h3>
            <p className="text-xs text-cx-muted mb-4">Your feedback helps others.</p>
            <div className="flex justify-center gap-2 mb-5 bg-white py-3 rounded-xl border border-cx-border shadow-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmittingRating}
                  onClick={() => handleRatingClick(star)}
                  className={`bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-110 ${isSubmittingRating ? 'opacity-50' : ''}`}
                >
                  <Icon
                    name={star <= reviewRating ? "star" : "star_border"}
                    size={28}
                    fill={star <= reviewRating ? 1 : 0}
                    style={{ color: '#f6a623' }}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you think?"
              className="w-full bg-white border border-cx-border rounded-xl px-4 py-3 text-sm text-cx-ink placeholder-cx-muted mb-4 resize-none outline-none focus:border-cx-teal focus:ring-4 focus:ring-[#14b8a6]/10 transition-all shadow-sm"
              rows={3}
            />
            <button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-60 hover:shadow-lg transition-shadow"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-4">
            {reviewsWithComments.length > 0 ? (
              reviewsWithComments.map((rev) => (
                <div key={rev.id || rev._id} className="bg-white rounded-2xl p-5 border border-cx-border shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cx-border to-[#e2e8f0] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        {rev.student?.profileImage?.url ? (
                          <img src={rev.student.profileImage.url} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-cx-muted">
                            {rev.student?.firstName?.charAt(0) || 'S'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-cx-ink leading-tight">
                          {rev.student?.firstName || 'Student'} {rev.student?.lastName || ''}
                        </p>
                        {rev.createdAt && (
                          <p className="text-[11px] text-cx-muted mt-0.5">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.ratings?.find(r => r.student?.id === rev.student?.id || r.student?._id === rev.student?._id) && (
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const userRatingObj = item.ratings.find(r => r.student?.id === rev.student?.id || r.student?._id === rev.student?._id);
                        const ratingValue = userRatingObj ? userRatingObj.rating : 0;
                        return (
                          <Icon
                            key={star}
                            name="star"
                            size={12}
                            fill={1}
                            style={{ color: star <= ratingValue ? '#f6a623' : '#e5e8ed' }}
                          />
                        );
                      })}
                    </div>
                  )}
                  {rev.comment && <p className="text-sm text-cx-ink4 leading-relaxed">{rev.comment}</p>}
                  {rev.agentReply && (
                    <div className="mt-3 bg-[#f8fafc] p-3 rounded-xl border border-cx-border border-l-2 border-l-[#7c6cf0]">
                      <p className="text-[10px] font-bold text-[#7c6cf0] mb-1 uppercase tracking-wide">Provider Reply</p>
                      <p className="text-xs text-cx-ink4">{rev.agentReply}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-cx-muted">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>

        {/* Sticky bottom bar (Mobile) */}
        <div className="fixed bottom-[88px] left-0 right-0 bg-white/80 backdrop-blur-md border-t border-cx-border/50 px-4 py-3 flex gap-3 z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <button
            onClick={handleMessage}
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-cx-border cursor-pointer bg-white"
          >
            <Icon name="chat_bubble" size={20} style={{ color: '#14b8a6' }} />
          </button>
          <button 
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm cursor-pointer border-none shadow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
            onClick={handleCTA}
            disabled={isRequesting}
          >
            {isRequesting ? 'Sending...' : ctaLabel}
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-cx-muted font-semibold mb-4 border-none bg-transparent cursor-pointer hover:text-cx-teal transition-colors"
        >
          <Icon name="arrow_back" size={16} />
          Back to results
        </button>

        {/* Title row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-cx-ink mb-1">{item.name}</h1>
            <div className="flex items-center gap-3 text-sm text-cx-muted">
              <div className="flex items-center gap-1">
                <Icon name="location_on" size={14} fill={1} style={{ color: '#9aa0ab' }} />
                <span>{item.dist} from campus</span>
              </div>
              {item.totalReviews > 0 && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Icon name="star" size={14} fill={1} style={{ color: '#f6a623' }} />
                    <span className="font-bold text-cx-ink3">{Number(item.rating).toFixed(1)}</span>
                    <span className="text-xs text-cx-muted">({item.totalReviews})</span>
                  </div>
                </>
              )}
              <span>·</span>
              <Badge text={item.badge} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cx-border bg-white text-cx-ink3 text-sm font-semibold cursor-pointer hover:bg-cx-bg transition-colors">
              <Icon name="share" size={16} />
              Share
            </button>
            <button
              onClick={handleSave}
              disabled={isMutating}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${isMutating ? 'opacity-70' : ''}`}
              style={{
                border: isSaved ? '1.5px solid #b9ece1' : '1.5px solid #ebedf0',
                background: isSaved ? '#e2f7f3' : 'white',
                color: isSaved ? '#14b8a6' : '#42474f',
              }}
            >
              {isMutating ? (
                <div className="w-4 h-4 border-2 border-cx-border border-t-cx-teal rounded-full animate-spin"></div>
              ) : (
                <Icon name="favorite" size={16} fill={isSaved ? 1 : 0} style={{ color: isSaved ? '#14b8a6' : '#42474f' }} />
              )}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Photo collage */}
        <div className="grid grid-cols-3 gap-2 mb-6" style={{ gridTemplateRows: '180px 180px' }}>
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-sm">
            {renderHeroImage()}
          </div>
          {itemImages ? (
            itemImages.slice(1, 5).map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            [1,2,3,4].map(i => (
              <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                <PlaceholderImg label="" style={{ width: '100%', height: '100%' }} />
              </div>
            ))
          )}
        </div>

        {/* Two-col below */}
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <div className="mb-6">
              <h2 className="font-bold text-cx-ink text-lg mb-2">About this {item.kind === 'lodge' ? 'lodge' : 'listing'}</h2>
              <p className="text-sm text-cx-ink4 leading-relaxed whitespace-pre-wrap">
                {item.description || (item.kind === 'lodge'
                  ? `A well-maintained ${item.type.toLowerCase()} located just ${item.dist} from campus. Perfect for students seeking comfort and convenience.`
                  : `${item.name} offers quality ${item.type.toLowerCase()} services for students. Conveniently located just ${item.dist} away.`)}
              </p>
            </div>

            {/* Dynamic Section */}
            {item.kind === 'lodge' && (
              <div className="mb-6">
                <h2 className="font-bold text-cx-ink text-lg mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map(a => (
                    <div key={a} className="flex items-center gap-1.5 bg-cx-teal-l px-3 py-2 rounded-xl">
                      <Icon name={AMENITY_ICONS[a] || AMENITY_ICONS['default']} size={16} fill={1} style={{ color: '#14b8a6' }} />
                      <span className="text-sm font-semibold text-cx-teal">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.kind === 'product' && item.delivery && (
              <div className="mb-6">
                <h2 className="font-bold text-cx-ink text-lg mb-3">Delivery Options</h2>
                <div className="bg-white rounded-xl px-4 py-3 border border-cx-border flex items-center justify-between max-w-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-cx-ink">{item.delivery.option}</span>
                    <span className="text-xs text-cx-muted">Estimated: {item.delivery.duration} mins</span>
                  </div>
                  <span className="text-sm font-bold text-cx-teal">{item.delivery.price > 0 ? fmt(item.delivery.price) : 'Free'}</span>
                </div>
              </div>
            )}

            {item.kind === 'service' && item.availableDays && (
              <div className="mb-6">
                <h2 className="font-bold text-cx-ink text-lg mb-3">Availability</h2>
                <div className="bg-white rounded-xl px-4 py-3 border border-cx-border flex items-center justify-between max-w-md">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-cx-ink">{item.availableDays.join(', ')}</span>
                    <span className="text-xs text-cx-muted">{item.time?.startTime} - {item.time?.endTime}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Provider card */}
            <div className="bg-white rounded-2xl border border-cx-border p-4 flex items-center gap-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-none shadow-md"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
              >
                {providerName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-cx-ink">{providerName}</p>
                  <Icon name="verified" size={16} fill={1} style={{ color: '#14b8a6' }} />
                </div>
                <p className="text-sm text-cx-muted">{item.kind === 'lodge' ? 'Verified Agent' : 'Verified Vendor'}</p>
              </div>
              <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cx-teal-b text-cx-teal font-semibold text-sm cursor-pointer hover:bg-cx-teal hover:text-white transition-colors"
                style={{ background: '#e2f7f3' }}
              >
                <Icon name="chat_bubble" size={16} />
                Message
              </button>
            </div>

            {/* Reviews Section (Desktop) */}
            <div className="mt-8">
              <h2 className="font-bold text-cx-ink text-lg mb-4">Reviews & Ratings</h2>
              
              <div className="flex flex-col gap-8">
                {/* Submit Form */}
                <div className="w-full">
                  <div className="bg-gradient-to-br from-[#f8fafc] to-white rounded-3xl p-6 md:p-8 border border-cx-border shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-cx-ink text-xl mb-1">Share your experience</h3>
                        <p className="text-sm text-cx-muted mb-4">Your feedback helps other students make better decisions.</p>
                        <div className="flex gap-2 mb-6 bg-white w-fit px-4 py-2 rounded-xl border border-cx-border shadow-sm">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              disabled={isSubmittingRating}
                              onClick={() => handleRatingClick(star)}
                              className={`bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-110 ${isSubmittingRating ? 'opacity-50' : ''}`}
                            >
                              <Icon
                                name={star <= reviewRating ? "star" : "star_border"}
                                size={32}
                                fill={star <= reviewRating ? 1 : 0}
                                style={{ color: '#f6a623' }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="w-full md:w-[400px]">
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="What did you think about this?"
                          className="w-full bg-white border border-cx-border rounded-xl px-4 py-3 text-sm text-cx-ink placeholder-cx-muted mb-4 resize-none outline-none focus:border-cx-teal focus:ring-4 focus:ring-[#14b8a6]/10 transition-all shadow-sm"
                          rows={4}
                        />
                        <button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className="w-full py-3.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-60 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                          style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="w-full">
                  {reviewsWithComments.length > 0 ? (
                    <div className="space-y-6">
                      {reviewsWithComments.map((rev) => (
                        <div key={rev.id || rev._id} className="bg-white rounded-2xl p-6 border border-cx-border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cx-border to-[#e2e8f0] flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                {rev.student?.profileImage?.url ? (
                                  <img src={rev.student.profileImage.url} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-lg font-bold text-cx-muted">
                                    {rev.student?.firstName?.charAt(0) || 'S'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-base font-bold text-cx-ink">
                                  {rev.student?.firstName || 'Student'} {rev.student?.lastName || ''}
                                </p>
                                {rev.createdAt && (
                                  <p className="text-xs text-cx-muted mt-0.5">
                                    {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                            {item.ratings?.find(r => r.student?.id === rev.student?.id || r.student?._id === rev.student?._id) && (
                              <div className="flex gap-1 bg-[#f8fafc] px-3 py-1.5 rounded-lg border border-cx-border">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const userRatingObj = item.ratings.find(r => r.student?.id === rev.student?.id || r.student?._id === rev.student?._id);
                                  const ratingValue = userRatingObj ? userRatingObj.rating : 0;
                                  return (
                                    <Icon
                                      key={star}
                                      name="star"
                                      size={14}
                                      fill={1}
                                      style={{ color: star <= ratingValue ? '#f6a623' : '#e5e8ed' }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {rev.comment && (
                            <p className="text-sm text-cx-ink4 leading-relaxed mt-2">{rev.comment}</p>
                          )}
                          {rev.agentReply && (
                            <div className="mt-4 bg-[#f8fafc] p-4 rounded-xl border border-cx-border border-l-4 border-l-[#7c6cf0]">
                              <p className="text-xs font-bold text-[#7c6cf0] mb-1.5 uppercase tracking-wide">Reply from provider</p>
                              <p className="text-sm text-cx-ink4">{rev.agentReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-cx-bg rounded-2xl border border-cx-border border-dashed">
                      <Icon name="rate_review" size={40} style={{ color: '#9aa0ab' }} />
                      <p className="font-bold text-cx-ink mt-3">No reviews yet</p>
                      <p className="text-sm text-cx-muted mt-1">Be the first to share your experience</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky booking card */}
          <div className="flex-none w-[360px]">
            <div className="bg-white rounded-2xl border border-cx-border p-5 sticky top-24 shadow-sm">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-extrabold text-cx-teal">{price.text}</span>
                {price.sub && <span className="text-sm text-cx-muted mb-0.5">{price.sub}</span>}
              </div>
              <div className="mb-4">
                <Badge text={item.badge} />
              </div>
              <button
                onClick={handleCTA}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer mb-2 hover:shadow-md transition-shadow"
                style={{ background: '#14b8a6' }}
              >
                {ctaLabel}
              </button>
              <button
                onClick={handleMessage}
                className="w-full py-3.5 rounded-xl font-bold text-sm border border-cx-border bg-white text-cx-ink3 cursor-pointer flex items-center justify-center gap-2 hover:bg-cx-bg transition-colors"
              >
                <Icon name="chat_bubble" size={16} />
                Message
              </button>
              <div className="border-t border-cx-border mt-4 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cx-muted">Type</span>
                  <span className="font-semibold text-cx-ink">{item.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cx-muted">Distance</span>
                  <span className="font-semibold text-cx-ink">{item.dist}</span>
                </div>
                {item.totalReviews > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cx-muted">Rating</span>
                    <div className="flex items-center gap-1">
                      <Icon name="star" size={14} fill={1} style={{ color: '#f6a623' }} />
                      <span className="font-semibold text-cx-ink">{Number(item.rating).toFixed(1)}</span>
                      <span className="text-xs text-cx-muted">({item.totalReviews})</span>
                    </div>
                  </div>
                )}
                {item.kind === 'lodge' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cx-muted">Payment</span>
                    <span className="font-semibold text-cx-ink">Annual</span>
                  </div>
                )}
                {item.kind === 'service' && item.perUnit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cx-muted">Unit</span>
                    <span className="font-semibold text-cx-ink">{item.perUnit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
