import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { CATEGORIES, ALL_ITEMS } from '../data.js'; // Fallback
import { ListingCard } from '../components/ListingCard.jsx';
import { PlaceholderImg } from '../components/PlaceholderImg.jsx';
import { Icon } from '../components/Icon.jsx';
import { getPrice } from '../data.js';
import { normalizeItem } from '../utils/normalizeItem.js';
import { 
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery
} from '../store/apiSlice';


const DISTANCE_OPTIONS = ['< 0.5 km', '< 1 km', '< 2 km', 'Any distance'];

const SUB_FILTERS = {
  Vendor: ['All', 'Food & Drinks', 'Electronics & Tech', 'Study & Office', 'Personal Care', 'Fashion', 'Appliances', 'Entertainment', 'Transport'],
  Lodge: ['All', 'Hostel', 'Self-Con', 'Flat', 'Shared Room'],
  Service: ['All', 'Laundry', 'Cleaning', 'Photography', 'Barbing & Hairdressing', 'Repairs']
};

export function Explore() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { catFilter, exploreMode } = state;
  const [search, setSearch] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState('Any distance');
  const [subFilter, setSubFilter] = useState('All');

  // Prevent background scrolling when map is full screen
  React.useEffect(() => {
    if (exploreMode === 'map') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [exploreMode]);

  const { data: productsRes, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: propertiesRes, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const { data: servicesRes, isLoading: isLoadingServices } = useGetServicesQuery();

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);

  const isLoadingItems = isLoadingProducts || isLoadingProperties || isLoadingServices;

  const combinedItems = [
    ...rawProperties.map(p => normalizeItem(p, 'lodge')),
    ...rawProducts.map(p => normalizeItem(p, 'product')),
    ...rawServices.map(p => normalizeItem(p, 'service')),
  ];

  const displayItems = combinedItems.length > 0 ? combinedItems : ALL_ITEMS;

  const filtered = displayItems.filter(item => {
    const matchCat = item.cat === catFilter || catFilter === 'All';
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchSub = subFilter === 'All' || item.type === subFilter;
    return matchCat && matchSearch && matchSub;
  });

  // Map pins (absolute positioned)
  const pins = displayItems.slice(0, 8).map((item, i) => {
    const positions = [
      { top: '20%', left: '20%' },
      { top: '35%', left: '55%' },
      { top: '55%', left: '30%' },
      { top: '25%', left: '80%' },
      { top: '65%', left: '70%' },
      { top: '75%', left: '40%' },
      { top: '45%', left: '15%' },
      { top: '85%', left: '60%' },
    ];
    const price = getPrice(item);
    return { ...item, pos: positions[i % positions.length], price };
  });

  const selectedItem = selectedPin ? displayItems.find(i => i.id === selectedPin) : null;

  const searchAndToggle = (
    <div className="flex flex-col md:flex-row gap-4 pointer-events-auto w-full max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="flex-1 flex items-center gap-3 bg-white/90 backdrop-blur shadow-lg rounded-full px-5 py-3.5 border border-cx-border focus-within:border-cx-teal focus-within:shadow-xl transition-all">
        <Icon name="search" size={22} style={{ color: '#1f2430' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties, foods, services..."
          className="flex-1 text-base text-cx-ink placeholder-cx-muted bg-transparent outline-none border-none font-medium"
          style={{ fontFamily: 'inherit' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="border-none bg-cx-bg w-7 h-7 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200">
            <Icon name="close" size={16} style={{ color: '#1f2430' }} />
          </button>
        )}
      </div>

      {/* List/Map Toggle */}
      <div className="flex-none flex items-center rounded-full overflow-hidden border border-cx-border bg-white shadow-lg p-1">
        <button
          onClick={() => dispatch({ type: 'SET_EXPLORE_MODE', value: 'list' })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-none cursor-pointer transition-colors"
          style={{
            background: exploreMode === 'list' ? '#1f2430' : 'transparent',
            color: exploreMode === 'list' ? '#fff' : '#5b6270',
          }}
        >
          <Icon name="view_list" size={18} />
          List
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_EXPLORE_MODE', value: 'map' })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-none cursor-pointer transition-colors"
          style={{
            background: exploreMode === 'map' ? '#1f2430' : 'transparent',
            color: exploreMode === 'map' ? '#fff' : '#5b6270',
          }}
        >
          <Icon name="map" size={18} />
          Map
        </button>
      </div>
    </div>
  );

  const categoryChips = (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-3xl mx-auto pointer-events-auto">
      {CATEGORIES.map(cat => (
        <button
          key={cat.name}
          onClick={() => {
            dispatch({ type: 'SET_CAT_FILTER', value: cat.name });
            setSubFilter('All');
            setSelectedPin(null);
          }}
          className="flex-none flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border-none cursor-pointer transition-shadow shadow-md active:scale-95"
          style={{
            background: catFilter === cat.name ? '#1f2430' : 'rgba(255, 255, 255, 0.95)',
            color: catFilter === cat.name ? '#fff' : '#5b6270',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Icon name={cat.icon} size={16} fill={catFilter === cat.name ? 1 : 0} />
          {cat.name}
        </button>
      ))}
    </div>
  );

  const currentSubFilters = SUB_FILTERS[catFilter] || [];
  const subFilterChips = currentSubFilters.length > 0 && (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide w-full max-w-3xl mx-auto pointer-events-auto mt-[-4px]">
      {currentSubFilters.map(sf => (
        <button
          key={sf}
          onClick={() => setSubFilter(sf)}
          className="flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors shadow-sm"
          style={{
            background: subFilter === sf ? '#1f2430' : 'rgba(255, 255, 255, 0.8)',
            color: subFilter === sf ? '#14b8a6' : '#5b6270',
            backdropFilter: 'blur(12px)',
          }}
        >
          {sf}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* --- FULL SCREEN MAP VIEW --- */}
      {exploreMode === 'map' && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[40] bg-cx-bg flex flex-col">
          {/* Floating Controls on Map */}
          <div className="absolute top-6 md:top-24 left-0 right-0 z-30 px-4 flex flex-col gap-4">
            {searchAndToggle}
            {categoryChips}
            {subFilterChips}
          </div>

          {/* Fake Map Background */}
          <div
            className="flex-1 relative"
            style={{
              background: 'repeating-linear-gradient(45deg, #e5f6f4 0 20px, #d8f2ee 20px 40px)',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
              <Icon name="map" size={64} style={{ color: '#a7dcd2' }} />
              <span className="font-bold text-lg text-[#8acfc2] mt-4 tracking-widest uppercase">Interactive Map Area</span>
            </div>

            {/* Price pins */}
            {!isLoadingItems && pins.filter(p => p.cat === catFilter || catFilter === 'All').map(pin => (
              <button
                key={pin.id}
                onClick={() => setSelectedPin(selectedPin === pin.id ? null : pin.id)}
                className="absolute flex items-center justify-center font-bold text-sm px-3 py-2 rounded-full shadow-lg cursor-pointer transition-all active:scale-95 border border-white/40"
                style={{
                  top: pin.pos.top,
                  left: pin.pos.left,
                  background: selectedPin === pin.id ? '#1f2430' : 'white',
                  color: selectedPin === pin.id ? 'white' : '#1f2430',
                  transform: selectedPin === pin.id ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)',
                  zIndex: selectedPin === pin.id ? 20 : 10,
                }}
              >
                {pin.price.text}
              </button>
            ))}
          </div>

          {/* Small overlay cards at the bottom of the map */}
          <div className="absolute bottom-28 md:bottom-12 left-0 right-0 w-full z-20">
            <div className="flex gap-4 overflow-x-auto px-4 md:pl-[320px] md:pr-8 pb-4 pt-2 scrollbar-hide snap-x">
              {!isLoadingItems && filtered.slice(0, 6).map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedPin(item.id);
                    if (selectedPin === item.id) {
                      navigate('/listing/' + item.id);
                    }
                  }}
                  className={`flex-none w-[280px] bg-white rounded-2xl p-2.5 flex gap-3 cursor-pointer transition-all snap-start shadow-xl ${selectedPin === item.id ? 'ring-2 ring-cx-teal ring-offset-2' : ''}`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-none">
                    <PlaceholderImg label={item.label} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-cx-ink text-sm truncate">{item.name}</p>
                      <p className="text-xs font-semibold text-cx-muted truncate">{item.type}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Icon name="star" size={12} fill={1} style={{ color: '#1f2430' }} />
                        <span className="text-xs font-bold text-cx-ink">{item.rating}</span>
                      </div>
                      <span className="text-sm font-extrabold text-cx-ink">{getPrice(item).text}</span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Spacer for proper end padding in scroll container */}
              <div className="flex-none w-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Overlay */}
      <div className={`relative z-10 md:flex md:gap-8 h-full ${exploreMode === 'map' ? 'pointer-events-none' : ''}`}>
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block flex-none w-[260px] pointer-events-auto">
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl border border-cx-border p-5 shadow-sm">
              <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Categories</p>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      dispatch({ type: 'SET_CAT_FILTER', value: cat.name });
                      setSelectedPin(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer text-left transition-all hover:bg-cx-bg"
                    style={{
                      background: catFilter === cat.name ? '#1f2430' : 'transparent',
                      color: catFilter === cat.name ? '#fff' : '#42474f',
                      boxShadow: catFilter === cat.name ? '0 4px 12px rgba(31,36,48,0.1)' : 'none',
                    }}
                  >
                    <Icon name={cat.icon} size={20} fill={catFilter === cat.name ? 1 : 0} style={{ color: catFilter === cat.name ? '#fff' : '#8a909b' }} />
                    <span className="text-sm font-bold flex-1">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Sub-filters Sidebar */}
              {currentSubFilters.length > 0 && (
                <div className="border-t border-cx-border mt-6 pt-6">
                  <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Filters</p>
                  <div className="space-y-1.5">
                    {currentSubFilters.map(sf => (
                      <button
                        key={sf}
                        onClick={() => setSubFilter(sf)}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-none cursor-pointer text-sm transition-colors hover:bg-cx-bg"
                        style={{
                          background: subFilter === sf ? '#e2f7f3' : 'transparent',
                          color: subFilter === sf ? '#14b8a6' : '#42474f',
                          fontWeight: subFilter === sf ? 700 : 500,
                        }}
                      >
                        {sf}
                        {subFilter === sf && (
                          <Icon name="check" size={18} style={{ color: '#14b8a6' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col h-[calc(100vh-80px)]">
          {/* Header row: Search + Toggle */}
          <div className="sticky top-0 z-30 pt-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 flex pointer-events-auto">
            {searchAndToggle}
          </div>

          {/* List Content Layer */}
          <div className={`flex-1 min-h-0 relative pointer-events-auto ${exploreMode === 'map' ? 'hidden' : 'block'}`}>
            {/* Mobile: category chips */}
            <div className="md:hidden flex-none -mx-4 px-4 pb-4">
              {categoryChips}
            </div>

            {/* Sub-filters for Mobile */}
            <div className="md:hidden flex-none -mx-4 px-4">
              {subFilterChips}
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-6 flex-none">
              <h2 className="text-xl font-extrabold text-cx-ink">
                {catFilter}
              </h2>
              <p className="text-sm font-semibold text-cx-muted bg-white px-3 py-1 rounded-full border border-cx-border">
                {isLoadingItems ? (
                  <span className="inline-block w-8 h-4 bg-cx-bg animate-pulse rounded" />
                ) : filtered.length} found
              </p>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto h-full pb-32">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingItems ? (
                  [1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm">
                      <div className="h-40 bg-cx-bg rounded-2xl mb-4"></div>
                      <div className="h-5 bg-cx-bg rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-cx-bg rounded w-1/2"></div>
                    </div>
                  ))
                ) : filtered.length > 0 ? (
                  filtered.map(item => (
                    <ListingCard key={item.id} item={item} variant="grid" />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-cx-border shadow-sm">
                    <div className="w-16 h-16 bg-cx-bg rounded-full flex items-center justify-center mb-4">
                      <Icon name="search_off" size={32} style={{ color: '#9aa0ab' }} />
                    </div>
                    <h3 className="text-lg font-bold text-cx-ink">No results found</h3>
                    <p className="text-sm text-cx-muted mt-2 max-w-sm">We couldn't find anything matching your search in {catFilter}. Try adjusting your filters.</p>
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
