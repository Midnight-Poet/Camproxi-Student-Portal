import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { CATEGORIES, ALL_ITEMS } from '../data.js'; // Fallback if needed
import { ListingCard } from '../components/ListingCard.jsx';
import { Icon } from '../components/Icon.jsx';
import { normalizeItem } from '../utils/normalizeItem.js';
import { 
  useGetMeQuery,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetNotificationsQuery
} from '../store/apiSlice';


export function Home() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { conversations } = state;
  
  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || userResponse;
  
  const { data: productsRes, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: propertiesRes, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const { data: servicesRes, isLoading: isLoadingServices } = useGetServicesQuery();
  const { data: notificationsRes } = useGetNotificationsQuery();
  console.log(propertiesRes)

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);
  const rawNotifications = Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes?.data || []);

  const unreadNotifications = rawNotifications.filter(n => !n.isRead).length;

  const isLoadingItems = isLoadingProducts || isLoadingProperties || isLoadingServices;

  // Combine and normalize fetched items
  const combinedItems = [
    ...rawProperties.map(p => normalizeItem(p, 'lodge')),
    ...rawProducts.map(p => normalizeItem(p, 'product')),
    ...rawServices.map(p => normalizeItem(p, 'service')),
  ];

  // If the backend has no items yet, fallback to ALL_ITEMS for display purposes so the UI isn't empty during dev
  const displayItems = combinedItems

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.firstName || 'User';

  function handleCategory(cat) {
    dispatch({ type: 'SET_CAT_FILTER', value: cat });
    navigate('/explore');
  }

  const featuredItems = displayItems.slice(0, 3);
  const nearbyItems = displayItems.slice(0, 6);

  return (
    <div className="animate-fadeIn px-5">
      {/* Header (Mostly for mobile, as desktop has TopNav) */}
      <div className="flex items-start justify-between mb-6 md:hidden">
        <div>
          <p className="text-cx-muted text-sm font-medium mb-0.5">{greeting},</p>
          {isLoadingUser ? (
            <div className="h-8 bg-cx-bg rounded-lg w-32 animate-pulse" />
          ) : (
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
              {firstName} 👋
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white border border-cx-border/50 shadow-sm cursor-pointer transition-all hover:bg-cx-bg hover:shadow"
            onClick={() => navigate('/messages')}
          >
            <Icon name="chat_bubble" size={20} style={{ color: '#5b6270' }} />
            {totalUnread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                style={{ background: '#ef4444' }}
              >
                {totalUnread}
              </span>
            )}
          </button>
          <button 
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white border border-cx-border/50 shadow-sm cursor-pointer transition-all hover:bg-cx-bg hover:shadow"
            onClick={() => navigate('/notifications')}
          >
            <Icon name="notifications" size={20} style={{ color: '#5b6270' }} />
            {unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-cx-teal border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Greeting & Search Bar Row */}
      <div className="hidden md:flex items-end justify-between mb-10 gap-6">
        <div>
          <p className="text-cx-muted text-base font-medium mb-1">{greeting},</p>
          {isLoadingUser ? (
            <div className="h-10 bg-cx-bg rounded-lg w-48 animate-pulse" />
          ) : (
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
              Welcome back, {firstName}
            </h1>
          )}
        </div>

        {/* Search bar (Desktop) */}
        <div
          className="w-[400px] lg:w-[500px] flex items-center gap-4 bg-white/90 backdrop-blur rounded-full pl-6 pr-2.5 py-2.5 border border-cx-border/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] cursor-text transition-all hover:border-cx-teal/30 group"
          onClick={() => navigate('/explore')}
        >
          <Icon name="search" size={22} style={{ color: '#8a909b' }} />
          <span className="text-cx-muted text-base flex-1 font-medium pointer-events-none group-hover:text-cx-ink transition-colors">Search lodges, food, services...</span>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}>
            <Icon name="tune" size={20} fill={0} style={{ color: 'white' }} />
          </div>
        </div>
      </div>

      {/* Mobile Search bar */}
      <div
        className="md:hidden flex items-center gap-3 bg-white/90 backdrop-blur rounded-full pl-5 pr-2 py-2 border border-cx-border/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] mb-8 cursor-text transition-all group active:scale-[0.98]"
        onClick={() => navigate('/explore')}
      >
        <Icon name="search" size={20} style={{ color: '#8a909b' }} />
        <span className="text-cx-muted text-sm flex-1 font-medium pointer-events-none truncate group-hover:text-cx-ink">Search lodges, food, services…</span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}>
          <Icon name="tune" size={18} fill={0} style={{ color: 'white' }} />
        </div>
      </div>

      {/* Categories */}
      <section className="mb-10">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCategory(cat.name)}
              className="group flex flex-col items-center rounded-3xl p-4 border border-transparent cursor-pointer gap-2 bg-white shadow-sm hover:shadow-lg hover:border-cx-teal/30 transition-all hover:-translate-y-1 md:py-6"
            >
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: cat.bg }}
              >
                <Icon name={cat.icon} size={24} fill={1} style={{ color: cat.color }} />
              </div>
              <div className="text-center mt-1">
                <p className="text-cx-ink text-sm font-bold leading-tight hidden md:block group-hover:text-cx-teal transition-colors">{cat.name}</p>
                <p className="text-cx-ink text-xs font-bold leading-tight md:hidden group-hover:text-cx-teal transition-colors">{cat.name.split(' ')[0]}</p>
                <p className="text-cx-muted text-xs hidden md:block mt-0.5">{cat.count} listings</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured near you */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-cx-ink tracking-tight">Featured near you</h2>
            <p className="text-sm text-cx-muted mt-1 hidden md:block">Handpicked premium options</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-sm font-bold text-cx-teal bg-cx-teal/10 hover:bg-cx-teal hover:text-white px-4 py-2 rounded-full border-none cursor-pointer transition-colors"
          >
            See all
          </button>
        </div>
        {isLoadingItems ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[260px] md:min-w-0 bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm">
                <div className="h-40 bg-cx-bg rounded-2xl mb-4"></div>
                <div className="h-5 bg-cx-bg rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-cx-bg rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
            {featuredItems.map(item => (
              <div key={item.id} className="snap-start min-w-[280px] md:min-w-0">
                <ListingCard item={item} variant="featured" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Near you */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-cx-ink tracking-tight">Near you</h2>
            <p className="text-sm text-cx-muted mt-1 hidden md:block">Discover places in your campus area</p>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-sm font-bold text-cx-teal bg-cx-teal/10 hover:bg-cx-teal hover:text-white px-4 py-2 rounded-full border-none cursor-pointer transition-colors"
          >
            See all
          </button>
        </div>
        {isLoadingItems ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
             {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[220px] md:min-w-0 bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm">
                <div className="h-32 bg-cx-bg rounded-2xl mb-4"></div>
                <div className="h-5 bg-cx-bg rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-cx-bg rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:hidden">
              {nearbyItems.map(item => (
                <div key={item.id} className="snap-start min-w-[240px]">
                  <ListingCard item={item} variant="scroll" />
                </div>
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-4 md:gap-6">
              {nearbyItems.map(item => (
                <ListingCard key={item.id} item={item} variant="grid" />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
