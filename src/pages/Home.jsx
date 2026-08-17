import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { CATEGORIES } from '../data.js';
import { ListingCard } from '../components/ListingCard.jsx';
import { Icon } from '../components/Icon.jsx';
import { normalizeItem } from '../utils/normalizeItem.js';
import { 
  useGetMeQuery,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetChatsQuery
} from '../store/apiSlice';

export function Home() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || userResponse;
  
  const { data: productsRes, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: propertiesRes, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const { data: servicesRes, isLoading: isLoadingServices } = useGetServicesQuery();

  const rawProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const rawProperties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const rawServices = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);

  const isLoadingItems = isLoadingProducts || isLoadingProperties || isLoadingServices;

  // Normalized items by category
  const lodges = rawProperties.map(p => normalizeItem(p, 'lodge'));
  const products = rawProducts.map(p => normalizeItem(p, 'product'));
  const services = rawServices.map(s => normalizeItem(s, 'service'));

  const { data: chatsRes } = useGetChatsQuery();
  const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);
  const totalUnread = chats.reduce((sum, chat) => {
    let unread = chat.unreadCount;
    if (unread === undefined) {
      unread = (chat.messages || []).filter(m => m.senderType === 'AGENT' && !m.isRead).length;
    }
    return sum + (unread || 0);
  }, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const username = user?.username || 'User';

  function handleCategory(catName) {
    dispatch({ type: 'SET_CAT_FILTER', value: catName });
    navigate('/explore');
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/explore');
    }
  }

  return (
    <div className="animate-fadeIn md:px-5 px-2 pb-12">
      {/* Header (Mobile) */}
      <div className="flex items-start justify-between mb-6 md:hidden">
        <div>
          <p className="text-cx-muted text-sm font-medium mb-0.5">{greeting},</p>
          {isLoadingUser ? (
            <div className="h-8 bg-cx-bg rounded-lg w-32 animate-pulse" />
          ) : (
            <h1 className="text-2xl capitalize font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
              {username}
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
        </div>
      </div>

      {/* Desktop Greeting & Search Form */}
      <div className="hidden md:flex items-end justify-between mb-10 gap-6">
        <div>
          <p className="text-cx-muted text-base font-medium mb-1">{greeting},</p>
          {isLoadingUser ? (
            <div className="h-10 bg-cx-bg rounded-lg w-48 animate-pulse" />
          ) : (
            <h1 className="text-4xl capitalize font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cx-ink to-cx-ink3">
              Welcome back, {username}
            </h1>
          )}
        </div>

        {/* Interactive Desktop Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-[400px] lg:w-[500px] flex items-center gap-3 bg-white/90 backdrop-blur rounded-full pl-6 pr-2.5 py-2 border border-cx-border/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgb(0,0,0,0.06)] transition-all hover:border-cx-teal/30 focus-within:border-cx-teal focus-within:ring-4 focus-within:ring-cx-teal/10"
        >
          <Icon name="search" size={22} style={{ color: '#8a909b' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lodges, food, services..."
            className="text-cx-ink text-base flex-1 font-medium bg-transparent border-none outline-none placeholder:text-cx-muted"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105 border-none cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}
          >
            <Icon name="arrow_forward" size={20} fill={0} style={{ color: 'white' }} />
          </button>
        </form>
      </div>

      {/* Interactive Mobile Search Form */}
      <form
        onSubmit={handleSearchSubmit}
        className="md:hidden flex items-center gap-3 bg-white/90 backdrop-blur rounded-full pl-5 pr-2 py-2 border border-cx-border/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] mb-8 transition-all focus-within:border-cx-teal"
      >
        <Icon name="search" size={20} style={{ color: '#8a909b' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search lodges, food, services…"
          className="text-cx-ink text-sm flex-1 font-medium bg-transparent border-none outline-none placeholder:text-cx-muted"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)' }}
        >
          <Icon name="arrow_forward" size={18} fill={0} style={{ color: 'white' }} />
        </button>
      </form>

      {/* Categories Grid */}
      <section className="mb-10">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {CATEGORIES.map(cat => {
            let dynamicCount = cat.count;
            if (cat.name === 'Lodge') dynamicCount = lodges.length || 0;
            if (cat.name === 'Vendor') dynamicCount = products.length || 0;
            if (cat.name === 'Service') dynamicCount = services.length || 0;

            return (
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
                  <p className="text-cx-muted text-xs hidden md:block mt-0.5">{dynamicCount} listings</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 1: Featured Campus Lodges */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-cx-ink tracking-tight">Campus Lodges & Hostels</h2>
            <p className="text-sm text-cx-muted mt-0.5">Explore student accommodations near campus</p>
          </div>
          <button
            onClick={() => handleCategory('Lodge')}
            className="text-xs md:text-sm font-bold text-cx-teal bg-cx-teal/10 hover:bg-cx-teal hover:text-white px-4 py-2 rounded-full border-none cursor-pointer transition-colors"
          >
            See all
          </button>
        </div>

        {isLoadingItems ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[270px] sm:w-[290px] md:w-[310px] flex-none bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm h-72" />
            ))}
          </div>
        ) : lodges.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cx-border/80 p-8 text-center">
            <Icon name="home_work" size={36} className="text-cx-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-cx-ink">No lodges listed yet</p>
          </div>
        ) : (
          <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory flex-nowrap min-w-0 w-full">
            {lodges.map(item => (
              <div key={item.id} className="snap-start w-[270px] sm:w-[290px] md:w-[310px] flex-none">
                <ListingCard item={item} variant="grid" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: Popular Vendors & Food */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-cx-ink tracking-tight">Campus Vendors & Goods</h2>
            <p className="text-sm text-cx-muted mt-0.5">Popular products, food, and essentials</p>
          </div>
          <button
            onClick={() => handleCategory('Vendor')}
            className="text-xs md:text-sm font-bold text-cx-teal bg-cx-teal/10 hover:bg-cx-teal hover:text-white px-4 py-2 rounded-full border-none cursor-pointer transition-colors"
          >
            See all
          </button>
        </div>

        {isLoadingItems ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[270px] sm:w-[290px] md:w-[310px] flex-none bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm h-72" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cx-border/80 p-8 text-center">
            <Icon name="storefront" size={36} className="text-cx-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-cx-ink">No vendor items listed yet</p>
          </div>
        ) : (
          <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory flex-nowrap min-w-0 w-full">
            {products.map(item => (
              <div key={item.id} className="snap-start w-[270px] sm:w-[290px] md:w-[310px] flex-none">
                <ListingCard item={item} variant="grid" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: Essential Student Services */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-cx-ink tracking-tight">Student Services</h2>
            <p className="text-sm text-cx-muted mt-0.5">Laundry, repairs, tutoring & logistics</p>
          </div>
          <button
            onClick={() => handleCategory('Service')}
            className="text-xs md:text-sm font-bold text-cx-teal bg-cx-teal/10 hover:bg-cx-teal hover:text-white px-4 py-2 rounded-full border-none cursor-pointer transition-colors"
          >
            See all
          </button>
        </div>

        {isLoadingItems ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-[270px] sm:w-[290px] md:w-[310px] flex-none bg-white border border-cx-border rounded-3xl p-4 animate-pulse shadow-sm h-72" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-cx-border/80 p-8 text-center">
            <Icon name="handyman" size={36} className="text-cx-muted mx-auto mb-2" />
            <p className="text-sm font-bold text-cx-ink">No services listed yet</p>
          </div>
        ) : (
          <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory flex-nowrap min-w-0 w-full">
            {services.map(item => (
              <div key={item.id} className="snap-start w-[270px] sm:w-[290px] md:w-[310px] flex-none">
                <ListingCard item={item} variant="grid" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
