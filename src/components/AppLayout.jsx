import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav.jsx';
import { SideNav } from './SideNav.jsx';
import { BottomNav } from './BottomNav.jsx';
import { Toast } from './Toast.jsx';
import { useGetNotificationsQuery } from '../store/apiSlice.js';
import { useApp } from '../context.jsx';

export function AppLayout() {
  const { showToast } = useApp();
  
  // Poll notifications every 1 second
  const { data: notifRes } = useGetNotificationsQuery(undefined, { pollingInterval: 1000 });
  const rawNotifications = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
  
  const prevLatestId = useRef(null);

  useEffect(() => {
    if (rawNotifications.length > 0) {
      // Assuming notifications are returned sorted by newest first
      const latest = rawNotifications[0];
      const latestId = latest.id || latest._id;
      
      if (prevLatestId.current && latestId !== prevLatestId.current && !latest.isRead) {
        showToast(latest.title ? `New: ${latest.title}` : 'New notification received!', { position: 'top' });
      }
      
      prevLatestId.current = latestId;
    }
  }, [rawNotifications, showToast]);
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
