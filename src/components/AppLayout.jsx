import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav.jsx';
import { SideNav } from './SideNav.jsx';
import { BottomNav } from './BottomNav.jsx';
import { Toast } from './Toast.jsx';
import { useGetNotificationsQuery } from '../store/apiSlice.js';
import { useNotificationSocket } from '../hooks/useNotificationSocket.js';
import { useChatSocket } from '../hooks/useChatSocket.js';
import { useApp } from '../context.jsx';

export function AppLayout() {
  const { pathname, search } = useLocation();
  const { showToast } = useApp();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);
  
  // Initialize notification and chat sockets globally for the app session
  useNotificationSocket();
  useChatSocket();

  // Fetch initial notifications once
  useGetNotificationsQuery();
  
  return (
    <div className="min-h-screen bg-cx-bg flex flex-col relative">
      <TopNav />
      <SideNav />
      <main className="flex-1 w-full max-w-[1440px] mx-auto pb-28 md:pb-0 px-4 md:px-12 py-4 md:py-8">
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
