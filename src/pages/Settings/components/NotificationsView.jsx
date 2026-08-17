import React, { useState, useEffect } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, Divider } from './SharedUI.jsx';
import { useApp } from '../../../context.jsx';
import { Toggle } from '../../../components/Toggle.jsx';
import { 
  useGetNotificationSettingsQuery, 
  useUpdateNotificationSettingsMutation,
  useRegisterPushTokenMutation
} from '../../../store/apiSlice.js';

export function NotificationsView({ user, onUpdateNotifications }) {
  const { showToast } = useApp();
  const { data: settingsRes, isLoading } = useGetNotificationSettingsQuery();
  const [updateNotificationSettings] = useUpdateNotificationSettingsMutation();
  const [registerPushToken] = useRegisterPushTokenMutation();

  const serverData = settingsRes?.data || settingsRes;
  const masterOn = serverData?.masterEnabled ?? user?.notificationsEnabled ?? true;

  const [categories, setCategories] = useState({
    newListings: true,
    priceDrops: true,
    interestUpdates: true,
    messages: true,
    promos: true,
    ...serverData?.categories,
  });

  useEffect(() => {
    if (serverData?.categories) {
      setCategories(prev => ({ ...prev, ...serverData.categories }));
    }
  }, [serverData]);

  async function handleMasterToggle() {
    const newVal = !masterOn;
    try {
      if (onUpdateNotifications) {
        await onUpdateNotifications(newVal);
      }
      await updateNotificationSettings({ masterEnabled: newVal }).unwrap();
      showToast(newVal ? 'Notifications enabled' : 'Notifications disabled', { position: 'top' });
    } catch {
      showToast('Failed to update notification setting');
    }
  }

  async function handleCategoryToggle(key) {
    const newVal = !categories[key];
    const updatedCategories = { ...categories, [key]: newVal };
    setCategories(updatedCategories);

    try {
      await updateNotificationSettings({
        categories: updatedCategories,
      }).unwrap();
    } catch {
      // Revert on error
      setCategories(prev => ({ ...prev, [key]: !newVal }));
      showToast('Failed to save preference');
    }
  }

  const handleRequestPushPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Push notifications not supported on this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Push permission granted!');
        // Register push token with backend
        await registerPushToken({
          platform: 'web',
          userAgent: navigator.userAgent,
        }).unwrap();
      } else {
        showToast('Push notifications blocked in browser');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not enable push notifications');
    }
  };

  const notificationItems = [
    { key: 'newListings', label: 'New listings', sub: 'Get notified when new listings are added on campus' },
    { key: 'priceDrops', label: 'Price drops', sub: 'Alerts when prices change on your saved listings' },
    { key: 'interestUpdates', label: 'Interest updates', sub: 'Updates on your property interest and booking requests' },
    { key: 'messages', label: 'Messages', sub: 'New direct messages from agents and vendors' },
    { key: 'promos', label: 'Promotions', sub: 'Campus deals, discounts, and featured listings' },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Notification Settings</h2>

      {/* Master toggle */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2">Global</p>
      <SectionCard>
        <div className="flex items-center px-5 py-4 gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-sm">
            <Icon name="notifications" size={20} style={{ color: '#f97316' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-cx-ink">Master Notifications Switch</p>
            <p className="text-xs font-medium text-cx-muted mt-0.5">
              Turn off to silence all notifications across the portal
            </p>
          </div>
          <Toggle on={masterOn} onToggle={handleMasterToggle} />
        </div>
      </SectionCard>

      {/* Browser Push Permission */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2 mt-6">Browser Device Push</p>
      <SectionCard>
        <div className="flex items-center px-5 py-4 gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shadow-sm">
            <Icon name="phonelink_ring" size={20} style={{ color: '#14b8a6' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-cx-ink">Web Push Notifications</p>
            <p className="text-xs font-medium text-cx-muted mt-0.5">
              Receive instant alerts even when the tab is closed
            </p>
          </div>
          <button
            onClick={handleRequestPushPermission}
            className="px-3.5 py-1.5 bg-cx-teal text-white rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-teal-600 transition-colors shadow-sm"
          >
            Enable Push
          </button>
        </div>
      </SectionCard>

      {/* Granular Notification Type Toggles */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2 mt-6">Notification Categories</p>
      <SectionCard>
        {notificationItems.map((item, i) => (
          <div key={item.key}>
            <div
              className={`flex items-center px-5 py-4 gap-4 transition-colors cursor-pointer ${masterOn ? 'hover:bg-slate-50' : 'opacity-50 pointer-events-none'}`}
              onClick={() => masterOn && handleCategoryToggle(item.key)}
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-cx-ink">{item.label}</p>
                <p className="text-xs font-medium text-cx-muted mt-0.5">{item.sub}</p>
              </div>
              <Toggle 
                on={Boolean(categories[item.key]) && masterOn} 
                onToggle={() => masterOn && handleCategoryToggle(item.key)} 
              />
            </div>
            {i < notificationItems.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>

      <p className="text-xs text-cx-muted px-2 mt-3">
        Settings are saved automatically to your profile in real time.
      </p>
    </div>
  );
}
