import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_ITEMS } from '../data.js'; // Fallback
import { ListingCard } from '../components/ListingCard.jsx';
import { Icon } from '../components/Icon.jsx';
import { normalizeItem } from '../utils/normalizeItem.js';
import { 
  useGetSavedItemsQuery,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useRemoveSavedItemMutation,
  useClearSavedItemsMutation,
} from '../store/apiSlice';



export function Saved() {
  const navigate = useNavigate();

  const { data: savedItemsRes, isLoading: isLoadingSaved } = useGetSavedItemsQuery();
  const rawSaved = Array.isArray(savedItemsRes) ? savedItemsRes : (savedItemsRes?.data || []);

  const { data: productsRes, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: propertiesRes, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const { data: servicesRes, isLoading: isLoadingServices } = useGetServicesQuery();

  const [removeSavedItem] = useRemoveSavedItemMutation();
  const [clearSavedItems, { isLoading: isClearing }] = useClearSavedItemsMutation();

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);

  const isLoadingItems = isLoadingSaved || isLoadingProducts || isLoadingProperties || isLoadingServices;

  const combinedItems = [
    ...rawProperties.map(p => normalizeItem(p, 'lodge')),
    ...rawProducts.map(p => normalizeItem(p, 'product')),
    ...rawServices.map(p => normalizeItem(p, 'service')),
  ];
  
  const displayItems = combinedItems.length > 0 ? combinedItems : ALL_ITEMS;

  // FIX #7: API returns `itemId`, not `item`
  const savedItems = displayItems.filter(item => 
    rawSaved.some(s => s.itemId === item.id)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-extrabold text-cx-ink">Saved</h1>
        {savedItems.length > 0 && (
          <button
            onClick={() => clearSavedItems()}
            disabled={isClearing}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-full border-none cursor-pointer transition-colors disabled:opacity-50"
          >
            <Icon name="delete_sweep" size={16} style={{ color: 'currentColor' }} />
            {isClearing ? 'Clearing...' : 'Clear all'}
          </button>
        )}
      </div>
      <p className="text-sm text-cx-muted mb-5">
        {isLoadingItems ? (
          <span className="inline-block w-24 h-4 bg-cx-bg animate-pulse rounded" />
        ) : (
          `${savedItems.length} saved listing${savedItems.length !== 1 ? 's' : ''}`
        )}
      </p>

      {isLoadingItems ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-cx-border rounded-2xl p-3 animate-pulse">
              <div className="h-32 bg-cx-bg rounded-xl mb-3"></div>
              <div className="h-4 bg-cx-bg rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-cx-bg rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : savedItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {savedItems.map(item => (
            <ListingCard key={item.id} item={item} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
            style={{ background: '#e2f7f3' }}
          >
            <Icon name="bookmark" size={28} fill={0} style={{ color: '#14b8a6' }} />
          </div>
          <h2 className="font-bold text-cx-ink text-lg mb-1">Nothing saved yet</h2>
          <p className="text-cx-muted text-sm mb-6">
            Tap the heart icon on any listing to save it here for later.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer hover:shadow-md transition-shadow"
            style={{ background: '#14b8a6' }}
          >
            Browse listings
          </button>
        </div>
      )}
    </div>
  );
}
