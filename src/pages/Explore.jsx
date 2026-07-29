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
  useGetServicesQuery,
  useGetSchoolsQuery
} from '../store/apiSlice';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getItemCoordinates, DEFAULT_MAP_CENTER } from '../utils/mapHelpers.js';
import { getDistanceToCampus } from '../utils/geo.js';
import { renderToString } from 'react-dom/server';
const DISTANCE_OPTIONS = ['< 0.5 km', '< 1 km', '< 2 km', 'Any distance'];

const SUB_FILTERS = {
  Vendor: ['All', 'Food & Drinks', 'Electronics & Tech', 'Study & Office', 'Personal Care', 'Fashion', 'Appliances', 'Entertainment', 'Transport'],
  Lodge: ['All', 'Self Con', 'Single Room', '1 Bed', '2 Bed', '3 Bed', 'Shared'],
  Service: ['All', 'Laundry', 'Cleaning', 'Repair', 'Tutoring', 'Design', 'Hair/Beauty', 'Logistics']
};

// Component to handle flying the map to a marker or fitting to bounds
function MapController({ selectedPin, markers, campusFilter, schoolsData }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (selectedPin) {
      const marker = markers.find(m => m.id === selectedPin);
      if (marker && marker.coords) {
        // Fly to marker with zoom 16
        map.flyTo(marker.coords, 16, { animate: true, duration: 1.5 });
      }
    } else {
      // Focus strictly on the campus(es)
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
          // If a single campus is selected, fly directly to it
          map.flyTo(campusCoords[0], 14, { animate: true, duration: 1.5 });
        } else {
          // If 'All' is selected, fit bounds to cover all campuses
          const bounds = L.latLngBounds(campusCoords);
          map.fitBounds(bounds, { 
            paddingTopLeft: [50, 50],
            paddingBottomRight: [50, 300], // Account for bottom cards
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
    // Add some default fallback if none found just for preview purposes
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
    
    // Campus filter match
    const matchCampus = state.campusFilter === 'All' || item.campus === state.campusFilter;
    
    // Distance filter match
    let matchDistance = true;
    if (state.distanceFilter !== 'Any distance') {
      const distStr = getDistanceToCampus(item, schoolsData); // e.g. "1.2 km from Main Campus Gate"
      const distMatch = distStr.match(/([0-9.]+)/);
      if (distMatch) {
        const distKm = parseFloat(distMatch[1]);
        if (state.distanceFilter === '< 0.5 km' && distKm > 0.5) matchDistance = false;
        if (state.distanceFilter === '< 1 km' && distKm > 1) matchDistance = false;
        if (state.distanceFilter === '< 2 km' && distKm > 2) matchDistance = false;
      }
    }

    return matchCat && matchSearch && matchSub && matchCampus && matchDistance;
  });

  // Map markers
  const mapMarkers = displayItems.map((item, i) => {
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
        // Calculate the position to scroll the container so the card is centered
        const containerWidth = container.offsetWidth;
        const cardWidth = card.offsetWidth;
        const cardOffset = card.offsetLeft;
        const scrollPosition = cardOffset - (containerWidth / 2) + (cardWidth / 2);
        container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [selectedPin, exploreMode]);

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

  const isLodge = state.catFilter === 'Lodge';

  const CustomDropdown = ({ value, options, onChange, icon }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="relative flex-1">
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between bg-white/90 backdrop-blur border border-white/40 text-cx-ink text-xs font-bold rounded-xl px-3 py-2.5 shadow-sm outline-none transition-all"
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
                className="w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-cx-bg"
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
    <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto pointer-events-auto">
      {/* Existing Sub-Category Chips (Hidden on Mobile for Lodge, Visible for others) */}
      <div className={`${isLodge ? 'hidden md:flex' : 'flex'} gap-2 overflow-x-auto scrollbar-hide py-1 snap-x`}>
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
      
      {/* Campus and Distance Dropdowns (Visible ONLY for Lodge) */}
      {isLodge && (
        <div className="flex gap-2 w-full px-1">
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
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* --- FULL SCREEN MAP VIEW --- */}
      {exploreMode === 'map' && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-[40] bg-cx-bg flex flex-col">
          {/* Floating Controls on Map */}
          <div className="absolute top-6 md:top-24 left-0 right-0 z-[1000] px-4 flex flex-col gap-4">
            {searchAndToggle}
            {categoryChips}
            {subFilterChips}
          </div>

          {/* Interactive Map Area */}
          <div className="flex-1 relative z-10 bg-[#e5f6f4]">
            <MapContainer 
              center={DEFAULT_MAP_CENTER} 
              zoom={14} 
              zoomControl={false}
              className="absolute inset-0 w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <MapController selectedPin={selectedPin} markers={mapMarkers} campusFilter={state.campusFilter} schoolsData={schoolsData} />
              
              {!isLoadingItems && mapMarkers.filter(m => m.cat === catFilter || catFilter === 'All').map(marker => {
                const isSelected = selectedPin === marker.id;
                
                // Create custom divIcon using the same styling as the old pins
                const customIcon = L.divIcon({
                  className: 'bg-transparent border-none w-0 h-0',
                  iconAnchor: [0, 0],
                  html: renderToString(
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: `translate(-50%, 0) ${isSelected ? 'scale(1.1)' : 'scale(1)'}`,
                      transformOrigin: 'bottom center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.15))',
                      zIndex: isSelected ? 100 : 10
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        background: isSelected ? '#1f2430' : 'white',
                        color: isSelected ? 'white' : '#1f2430',
                        border: '1px solid rgba(0,0,0,0.05)',
                        whiteSpace: 'nowrap',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        {marker.price.text}
                      </div>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: isSelected ? '#1f2430' : 'white',
                        transform: 'rotate(45deg)',
                        marginTop: '-6px',
                        marginBottom: '2px',
                        zIndex: 1,
                        borderRight: '1px solid rgba(0,0,0,0.05)',
                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                      }} />
                    </div>
                  ),
                  iconSize: null,
                });

                return (
                  <Marker 
                    key={marker.id} 
                    position={marker.coords}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => setSelectedPin(isSelected ? null : marker.id),
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>

          {/* Small overlay cards at the bottom of the map */}
          <div className="absolute bottom-28 md:bottom-12 left-0 right-0 w-full z-[1000]">
            <div id="map-cards-container" className="flex gap-4 overflow-x-auto px-4 md:pl-[320px] md:pr-8 pb-4 pt-2 scrollbar-hide snap-x">
              {!isLoadingItems && filtered.map(item => (
                <div
                  key={item.id}
                  id={`map-card-${item.id}`}
                  onClick={() => {
                    setSelectedPin(item.id);
                    if (selectedPin === item.id) {
                      navigate('/listing/' + item.id);
                    }
                  }}
                  className={`flex-none w-[280px] bg-white rounded-2xl p-2.5 flex gap-3 cursor-pointer transition-all snap-start shadow-xl ${selectedPin === item.id ? 'ring-2 ring-cx-teal ring-offset-2' : ''}`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-none bg-cx-bg">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <PlaceholderImg label={item.label} style={{ width: '100%', height: '100%' }} />
                    )}
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
          <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide pb-8">
            <div className="bg-white rounded-3xl border border-cx-border p-5 shadow-sm">
              <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Categories</p>
              <div className="space-y-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      dispatch({ type: 'SET_CAT_FILTER', value: cat.name });
                      setSubFilter('All');
                      setSelectedPin(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer text-left transition-all hover:bg-cx-bg"
                    style={{
                      background: state.catFilter === cat.name ? '#1f2430' : 'transparent',
                      color: state.catFilter === cat.name ? 'white' : '#1f2430',
                    }}
                  >
                    <Icon name={cat.icon} size={20} />
                    <span className="font-bold flex-1">{cat.name}</span>
                  </button>
                ))}
              </div>

              {!isLodge && SUB_FILTERS[state.catFilter === 'All' ? 'Vendor' : state.catFilter] && (
                <div className="border-t border-cx-border mt-6 pt-6">
                  <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Filters</p>
                  <div className="space-y-1.5">
                    {SUB_FILTERS[state.catFilter === 'All' ? 'Vendor' : state.catFilter].map(sf => (
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

            {isLodge && (
              <>
                <div className="bg-white rounded-3xl border border-cx-border p-5 shadow-sm">
                  <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Campus</p>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                    {ALL_CAMPUSES.map(campus => (
                      <button
                        key={campus}
                        onClick={() => {
                          dispatch({ type: 'SET_CAMPUS_FILTER', value: campus });
                          setSelectedPin(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border-none cursor-pointer text-left transition-all hover:bg-cx-bg"
                        style={{
                          background: state.campusFilter === campus ? '#14b8a6' : 'transparent',
                          color: state.campusFilter === campus ? 'white' : '#5b6270',
                        }}
                      >
                        <span className="font-bold flex-1 text-sm">{campus}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-cx-border p-5 shadow-sm">
                  <p className="text-xs font-bold text-cx-ink3 mb-4 uppercase tracking-wider">Distance</p>
                  <div className="space-y-1.5">
                    {DISTANCE_OPTIONS.map(dist => (
                      <button
                        key={dist}
                        onClick={() => {
                          dispatch({ type: 'SET_DISTANCE_FILTER', value: dist });
                          setSelectedPin(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border-none cursor-pointer text-left transition-all hover:bg-cx-bg"
                        style={{
                          background: state.distanceFilter === dist ? '#14b8a6' : 'transparent',
                          color: state.distanceFilter === dist ? 'white' : '#5b6270',
                        }}
                      >
                        <span className="font-bold flex-1 text-sm">{dist}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
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
