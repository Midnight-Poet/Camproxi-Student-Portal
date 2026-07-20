import { useNavigate } from 'react-router-dom';
import { getPrice } from '../data.js';
import { PlaceholderImg } from './PlaceholderImg.jsx';
import { Badge } from './Badge.jsx';
import { Icon } from './Icon.jsx';
import { useGetSavedItemsQuery, useSaveItemMutation, useRemoveSavedItemMutation } from '../store/apiSlice';
import { useApp } from '../context.jsx';

// Maps item kind to API's itemCategory enum
const ITEM_CATEGORY_MAP = { lodge: 'PROPERTY', product: 'PRODUCT', service: 'SERVICE', business: 'PRODUCT' };

export function ListingCard({ item, variant = 'featured' }) {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const price = getPrice(item);

  // Real saved state from API
  const { data: savedItemsRes } = useGetSavedItemsQuery();
  const rawSaved = Array.isArray(savedItemsRes) ? savedItemsRes : (savedItemsRes?.data || []);
  // FIX #7: use itemId field (not item)
  const savedRecord = rawSaved.find(s => s.itemId === item.id);
  const isSaved = !!savedRecord;

  const [saveItem, { isLoading: isSaving }] = useSaveItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveSavedItemMutation();
  const isMutating = isSaving || isRemoving;

  async function handleSave(e) {
    e.stopPropagation();
    if (isMutating) return;
    try {
      if (isSaved) {
        // FIX #9: use id (not _id)
        await removeItem(savedRecord.id).unwrap();
        showToast('Removed from saved');
      } else {
        // FIX #8: correct payload fields and uppercase enum
        await saveItem({
          itemId: item.id,
          itemCategory: ITEM_CATEGORY_MAP[item.kind] || 'PRODUCT',
        }).unwrap();
        showToast('Saved!');
      }
    } catch (err) {
      console.error('Failed to toggle save', err);
      showToast('Could not update saved. Try again.');
    }
  }

  function handleClick() {
    navigate('/listing/' + item.id);
  }

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-transparent hover:border-cx-border/60 cursor-pointer hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-500 group-hover:scale-105">
            <PlaceholderImg label={item.label} className="w-full object-cover" style={{ height: 190 }} />
          </div>
          <div className="absolute top-3 left-3 z-10">
            <Badge text={item.badge} />
          </div>
          <button
            onClick={handleSave}
            disabled={isMutating}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10 disabled:opacity-60"
          >
            <Icon name={isSaved ? "favorite" : "favorite_border"} size={20} fill={isSaved ? 1 : 0} style={{ color: isSaved ? '#ef4444' : '#1f2430' }} />
          </button>
        </div>
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-cx-ink text-base truncate">{item.name}</p>
              <p className="text-sm font-medium text-cx-muted mt-0.5 truncate">{item.type}</p>
            </div>
            <div className="text-right flex-none bg-cx-bg px-2.5 py-1.5 rounded-xl">
              <p className="font-extrabold text-cx-teal text-sm">{price.text}</p>
              {price.sub && <p className="text-xs font-semibold text-cx-muted mt-0.5">{price.sub}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-cx-border/50">
            {item.totalReviews > 0 ? (
              <div className="flex items-center gap-1.5">
                <Icon name="star" size={16} fill={1} style={{ color: '#f59e0b' }} />
                <span className="text-sm font-bold text-cx-ink">{Number(item.rating).toFixed(1)}</span>
              </div>
            ) : (
              <div></div>
            )}
            <div className="flex items-center gap-1.5 text-cx-muted">
              <Icon name="location_on" size={16} />
              <span className="text-sm font-medium">{item.dist}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        onClick={handleClick}
        className="group bg-white rounded-[20px] overflow-hidden shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-transparent hover:border-cx-border/50 cursor-pointer hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-500 group-hover:scale-105">
            <PlaceholderImg label={item.label} className="w-full object-cover" style={{ height: 150 }} />
          </div>
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge text={item.badge} small />
          </div>
          <button
            onClick={handleSave}
            disabled={isMutating}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition-transform z-10 disabled:opacity-60"
          >
            <Icon name={isSaved ? "favorite" : "favorite_border"} size={18} fill={isSaved ? 1 : 0} style={{ color: isSaved ? '#ef4444' : '#1f2430' }} />
          </button>
        </div>
        <div className="p-3.5">
          <p className="font-extrabold text-cx-ink text-sm truncate">{item.name}</p>
          <p className="text-xs font-medium text-cx-muted mt-1 truncate">{item.type} · {item.dist}</p>
          <div className="flex items-center justify-between mt-3">
            {item.totalReviews > 0 ? (
              <div className="flex items-center gap-1 bg-cx-bg px-2 py-1 rounded-lg">
                <Icon name="star" size={14} fill={1} style={{ color: '#f59e0b' }} />
                <span className="text-xs font-bold text-cx-ink">{Number(item.rating).toFixed(1)}</span>
              </div>
            ) : (
              <div></div>
            )}
            <span className="text-sm font-extrabold text-cx-teal">{price.text}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'scroll') {
    return (
      <div
        onClick={handleClick}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-cx-border/50 cursor-pointer hover:shadow-md transition-all active:scale-95 flex-none"
        style={{ width: 170 }}
      >
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-500 group-hover:scale-105">
            <PlaceholderImg label={item.label} className="w-full object-cover" style={{ height: 120 }} />
          </div>
          <button
            onClick={handleSave}
            disabled={isMutating}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm z-10 disabled:opacity-60"
          >
            <Icon name={isSaved ? "favorite" : "favorite_border"} size={16} fill={isSaved ? 1 : 0} style={{ color: isSaved ? '#ef4444' : '#1f2430' }} />
          </button>
        </div>
        <div className="p-3">
          <p className="font-extrabold text-cx-ink text-xs truncate">{item.name}</p>
          <p className="text-[11px] font-medium text-cx-muted mt-0.5 truncate">{item.type}</p>
          <div className="flex items-center justify-between mt-2">
            {item.totalReviews > 0 ? (
              <div className="flex items-center gap-1">
                <Icon name="star" size={12} fill={1} style={{ color: '#f59e0b' }} />
                <span className="text-[11px] font-bold text-cx-ink">{Number(item.rating).toFixed(1)}</span>
              </div>
            ) : (
              <div></div>
            )}
            <p className="text-xs font-extrabold text-cx-teal truncate pl-2">{price.text}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
