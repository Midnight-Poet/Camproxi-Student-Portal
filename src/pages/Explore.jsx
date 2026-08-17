import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { CATEGORIES, ALL_ITEMS, getPrice } from '../data.js';
import { ListingCard } from '../components/ListingCard.jsx';
import { Icon } from '../components/Icon.jsx';
import { normalizeItem } from '../utils/normalizeItem.js';
import { 
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetSchoolsQuery
} from '../store/apiSlice';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getItemCoordinates, DEFAULT_MAP_CENTER } from '../utils/mapHelpers.js';
import { getDistanceToCampus } from '../utils/geo.js';
import { renderToString } from 'react-dom/server';

const DISTANCE_OPTIONS = ['Any distance', '< 0.5 km', '< 1 km', '< 2 km'];
const PRICE_OPTIONS = ['Any price', '< ₦50k', '₦50k - ₦150k', '₦150k - ₦300k', '> ₦300k'];

const SUB_FILTERS = {
  Vendor: ['All', 'Food & Drinks', 'Electronics & Tech', 'Study & Office', 'Personal Care', 'Fashion', 'Appliances', 'Entertainment', 'Transport'],
  Lodge: ['All', 'Self Con', 'Single Room', '1 Bed', '2 Bed', '3 Bed', 'Shared'],
  Service: ['All', 'Laundry', 'Cleaning', 'Repair', 'Tutoring', 'Design', 'Hair/Beauty', 'Logistics']
};

function getItemNumericPrice(item) {
  if (typeof item.price === 'number') return item.price;
  if (typeof item.price === 'string') {
    const num = parseFloat(item.price.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) return num;
  }
  if (item.menu && item.menu.length > 0) {
    const prices = item.menu.map(m => m.p).filter(p => typeof p === 'number' && isFinite(p));
    if (prices.length > 0) return Math.min(...prices);
  }
  return 0;
}

// Component to handle flying the map to a marker or fitting to bounds
function MapController({ selectedPin, markers, campusFilter, schoolsData }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (selectedPin) {
      const marker = markers.find(m => m.id === selectedPin);
      if (marker && marker.coords) {
        map.flyTo(marker.coords, 16, { animate: true, duration: 1.5 });
      }
    } else {
      const campusCoords = [];
      if (schoolsData) {
        schoolsData.forEach(school => {
          if (school.campus && Array.isArray(school.campus)) {
            school.campus.forEach(c => {
              if (campusFilter === 'All' || campusFilter === c.name) {
                if (c.location) {
                  const lat = c.location.lat !== undefined ? c.location.lat : c.location.latitude;
                  const lng = c.location.lng !== undefined ? c.location.lng : c.location.longitude;
                  if (lat !== undefined && lng !== undefined) {
                    campusCoords.push([Number(lat), Number(lng)]);
                  }
                }
              }
            });
          }
        });
      }

      if (campusCoords.length > 0) {
        if (campusFilter !== 'All' && campusCoords.length === 1) {
          map.flyTo(campusCoords[0], 14, { animate: true, duration: 1.5 });
        } else {
          const bounds = L.latLngBounds(campusCoords);
          map.fitBounds(bounds, { 
            paddingTopLeft: [50, 50],
            paddingBottomRight: [50, 300],
            maxZoom: 14,
            animate: true, 
            duration: 1.0 
          });
        }
      }
    }
  }, [selectedPin, markers, map, campusFilter, schoolsData]);

  return null;
}

export function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const { state, dispatch } = useApp();
  const { catFilter, exploreMode } = state;
  const [search, setSearch] = useState(queryParam);
  const [selectedPin, setSelectedPin] = useState(null);
  const [subFilter, setSubFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('Any price');

  // Keep search state synchronized with URL q param
  useEffect(() => {
    if (queryParam !== search) {
      setSearch(queryParam);
    }
  }, [queryParam]);

  // Ensure map mode is inaccessible when category is NOT Lodge
  useEffect(() => {
    if (catFilter !== 'Lodge' && exploreMode === 'map') {
      dispatch({ type: 'SET_EXPLORE_MODE', value: 'list' });
    }
  }, [catFilter, exploreMode, dispatch]);

  // Prevent background scrolling when map is full screen
  useEffect(() => {
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
  const { data: schoolsRes } = useGetSchoolsQuery();

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);
  const schoolsData = Array.isArray(schoolsRes) ? schoolsRes : (schoolsRes?.data || []);

  const isLoadingItems = isLoadingProducts || isLoadingProperties || isLoadingServices;

  // Compute all available campuses from the schools API
  const ALL_CAMPUSES = React.useMemo(() => {
    const campuses = ['All'];
    schoolsData.forEach(school => {
      if (school.campus && Array.isArray(school.campus)) {
        school.campus.forEach(c => {
          if (c.name && !campuses.includes(c.name)) {
            campuses.push(c.name);
          }
        });
      }
    });
    if (campuses.length === 1) {
      campuses.push('Crystal Campus', 'Main Campus', 'North Campus');
    }
    return campuses;
  }, [schoolsData]);

  const combinedItems = [
    ...rawProperties.map(p => normalizeItem(p, 'lodge')),
    ...rawProducts.map(p => normalizeItem(p, 'product')),
    ...rawServices.map(p => normalizeItem(p, 'service')),
  ];

  const displayItems = combinedItems.length > 0 ? combinedItems : ALL_ITEMS;

  const filtered = displayItems.filter(item => {
    const matchCat = item.cat === state.catFilter || state.catFilter === 'All';
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchSub = subFilter === 'All' || item.type === subFilter;
    const matchCampus = state.campusFilter === 'All' || item.campus === state.campusFilter;
    
    // Distance filter match
    let matchDistance = true;
    if (state.distanceFilter !== 'Any distance') {
      const distStr = getDistanceToCampus(item, schoolsData);
      const distMatch = distStr.match(/([0-9.]+)/);
      if (distMatch) {
        const distKm = parseFloat(distMatch[1]);
        if (state.distanceFilter === '< 0.5 km' && distKm > 0.5) matchDistance = false;
        if (state.distanceFilter === '< 1 km' && distKm > 1) matchDistance = false;
        if (state.distanceFilter === '< 2 km' && distKm > 2) matchDistance = false;
      }
    }

    // Price range filter match
    let matchPrice = true;
    if (priceFilter !== 'Any price') {
      const priceNum = getItemNumericPrice(item);
      if (priceFilter === '< ₦50k' && priceNum >= 50000) matchPrice = false;
      if (priceFilter === '₦50k - ₦150k' && (priceNum < 50000 || priceNum > 150000)) matchPrice = false;
      if (priceFilter === '₦150k - ₦300k' && (priceNum < 150000 || priceNum > 300000)) matchPrice = false;
      if (priceFilter === '> ₦300k' && priceNum <= 300000) matchPrice = false;
    }

    return matchCat && matchSearch && matchSub && matchCampus && matchDistance && matchPrice;
  });

  // Filter property lodges for map (only properties should be listed on map)
  const propertyItems = filtered.filter(item => item.cat === 'Lodges' || item.kind === 'lodge');

  // Map markers - ONLY properties
  const mapMarkers = propertyItems.map((item, i) => {
    const price = getPrice(item);
    const coords = getItemCoordinates(item, i);
    return { ...item, coords, price };
  });

  const selectedItem = selectedPin ? displayItems.find(i => i.id === selectedPin) : null;

  React.useEffect(() => {
    if (selectedPin && exploreMode === 'map') {
      const card = document.getElementById(`map-card-${selectedPin}`);
      const container = document.getElementById('map-cards-container');
      if (card && container) {
        const containerWidth = container.offsetWidth;
        const cardWidth = card.offsetWidth;
        const cardOffset = card.offsetLeft;
        const scrollPosition = cardOffset - (containerWidth / 2) + (cardWidth / 2);
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [selectedPin, exploreMode]);

  const isLodge = state.catFilter === 'Lodge';

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

      {/* List/Map Toggle - ONLY Accessible when category is Lodge */}
      {isLodge && (
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
      )}
    </div>
  );

  const categoryChips = (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-3xl mx-auto pointer-events-auto">
      {CATEGORIES.map(cat => (
        <button
          key={cat.name}
          onClick={() => {
            dispatch({ type: 'SET_CAT_FILTER', value: cat.name });
            if (cat.name !== 'Lodge' && exploreMode === 'map') {
              dispatch({ type: 'SET_EXPLORE_MODE', value: 'list' });
            }
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

  const CustomDropdown = ({ value, options, onChange, icon }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="relative flex-1 min-w-[120px]">
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-white/90 backdrop-blur border border-white/40 text-cx-ink text-xs font-bold rounded-xl px-3 py-2.5 shadow-sm outline-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-1.5 truncate">
            {icon && <Icon name={icon} size={14} style={{ color: '#5b6270' }} />}
            <span className="truncate">{value}</span>
          </div>
          <Icon name="expand_more" size={16} style={{ color: '#5b6270' }} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-cx-border rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-cx-bg border-none cursor-pointer"
                style={{
                  color: value === opt ? '#14b8a6' : '#5b6270',
                  background: value === opt ? '#e2f7f3' : 'transparent',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const subFilterChips = (
    <div className="flex flex-col gap-2.5 w-full max-w-3xl mx-auto pointer-events-auto">
      {/* Sub-Category Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 snap-x">
        {SUB_FILTERS[state.catFilter === 'All' ? 'Vendor' : state.catFilter].map(sf => (
          <button
            key={sf}
            onClick={() => setSubFilter(sf)}
            className="flex-none px-4 py-2 rounded-full text-sm font-bold border border-white/20 cursor-pointer transition-all snap-start shadow-sm"
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
      
      {/* Price, Campus and Distance Filter Dropdowns */}
      <div className="flex gap-2 w-full px-1">
        <CustomDropdown 
          value={priceFilter}
          options={PRICE_OPTIONS}
          icon="payments"
          onChange={val => setPriceFilter(val)}
        />
        {isLodge && (
          <>
            <CustomDropdown 
              value={state.campusFilter}
              options={ALL_CAMPUSES}
              icon="school"
              onChange={val => {
                dispatch({ type: 'SET_CAMPUS_FILTER', value: val });
                setSelectedPin(null);
              }}
            />
            <CustomDropdown 
              value={state.distanceFilter}
              options={DISTANCE_OPTIONS}
              icon="straighten"
              onChange={val => {
                dispatch({ type: 'SET_DISTANCE_FILTER', value: val });
                setSelectedPin(null);
              }}
            />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* --- FULL SCREEN MAP VIEW (Lodges Only, Clean Overlay) --- */}
      {exploreMode === 'map' && isLodge && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[40] bg-cx-bg flex flex-col">
          {/* Uncrowded Floating Controls on Map */}
          <div className="absolute top-6 md:top-24 left-0 right-0 z-[1000] px-4 flex flex-col gap-3">
            {searchAndToggle}
            {categoryChips}
          </div>

          {/* Interactive Map Area */}
          <div className="flex-1 relative z-10 bg-[#e5f6f4]">
            <MapContainer 
              center={DEFAULT_MAP_CENTER} 
              zoom={13} 
              className="w-full h-full"
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController 
                selectedPin={selectedPin} 
                markers={mapMarkers} 
                campusFilter={state.campusFilter}
                schoolsData={schoolsData}
              />

              {mapMarkers.map(m => {
                const isSelected = m.id === selectedPin;
                const customIcon = L.divIcon({
                  className: 'custom-map-pin',
                  html: renderToString(
                    <div className={`relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}`}>
                      <div className={`px-3 py-1.5 rounded-full shadow-lg border-2 flex items-center gap-1 text-xs font-bold whitespace-nowrap ${
                        isSelected 
                          ? 'bg-cx-teal text-white border-white ring-4 ring-teal-500/20' 
                          : 'bg-slate-900 text-white border-slate-700 hover:bg-cx-teal'
                      }`}>
                        <span>{m.price?.text || 'Check Price'}</span>
                      </div>
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r-2 border-b-2 ${
                        isSelected ? 'bg-cx-teal border-white' : 'bg-slate-900 border-slate-700'
                      }`} />
                    </div>
                  ),
                  iconSize: [80, 35],
                  iconAnchor: [40, 35]
                });

                return (
                  <Marker 
                    key={m.id} 
                    position={m.coords}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedPin(m.id);
                      }
                    }}
                  >
                    <Popup closeButton={false} className="custom-leaflet-popup">
                      <div className="p-1 max-w-[200px]">
                        <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{getDistanceToCampus(m, schoolsData)}</p>
                        <button 
                          onClick={() => navigate(`/listing/${m.id}`)}
                          className="mt-2 w-full py-1 bg-cx-teal text-white rounded-lg text-xs font-bold border-none cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Bottom Horizontal Cards Carousel on Map */}
          <div 
            id="map-cards-container"
            className="absolute bottom-24 md:bottom-6 left-0 right-0 z-[1000] flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory pointer-events-auto"
          >
            {propertyItems.map(item => {
              const isSelected = item.id === selectedPin;
              const priceObj = getPrice(item);
              const imgUrl = item.image || item.images?.[0]?.url || item.images?.[0] || item.avatar;

              return (
                <div 
                  id={`map-card-${item.id}`}
                  key={item.id} 
                  onClick={() => setSelectedPin(item.id)}
                  className={`snap-center flex-none w-[290px] sm:w-[340px] transition-all cursor-pointer ${
                    isSelected ? 'scale-[1.02] z-20' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  <div className={`bg-white/95 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border transition-all ${
                    isSelected ? 'border-cx-teal ring-4 ring-teal-500/20' : 'border-white/60'
                  }`}>
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-none relative">
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <Icon name="home_work" size={24} className="text-slate-400" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur">
                          ★ {item.rating || '4.8'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-cx-teal block mb-0.5">
                          {item.type || item.category || 'Lodge'}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm truncate mb-0.5">
                          {item.name}
                        </h4>
                        <p className="text-xs font-bold text-slate-700">
                          {priceObj?.text || 'Check price'} <span className="text-[11px] font-semibold text-slate-400">{priceObj?.sub}</span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/listing/${item.id}`);
                          }}
                          className="mt-1.5 px-3 py-1 bg-slate-900 hover:bg-cx-teal text-white rounded-full text-[11px] font-bold transition-colors border-none cursor-pointer"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- STANDARD LIST VIEW --- */}
      {exploreMode === 'list' && (
        <div className="max-w-5xl mx-auto py-2 md:py-6">
          <div className="flex flex-col gap-4 mb-6">
            {searchAndToggle}
            {categoryChips}
            {subFilterChips}
          </div>

          {/* Grid of Filtered Items */}
          {isLoadingItems ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm h-72"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-cx-border my-8">
              <Icon name="search_off" size={48} className="text-cx-muted mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-cx-ink mb-1">No listings found</h3>
              <p className="text-sm text-cx-muted">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(item => (
                <ListingCard key={item.id} item={item} variant="grid" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
