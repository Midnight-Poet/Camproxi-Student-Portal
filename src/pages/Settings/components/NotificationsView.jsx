import React, { useState } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, RowItem, SaveButton, Divider } from './SharedUI.jsx';
import { useApp } from '../../../context.jsx';
import { Toggle } from '../../../components/Toggle.jsx';

export function NotificationsView({ user, onUpdateNotifications }) {
  const [masterOn, setMasterOn] = useState(user?.notificationsEnabled ?? true);
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useApp();
  const { settings } = state;

  async function handleMasterToggle() {
    const newVal = !masterOn;
    setMasterOn(newVal);
    setLoading(true);
    await onUpdateNotifications(newVal);
    setLoading(false);
  }

  const localItems = [
    { key: 'newListings', label: 'New listings', sub: 'Get notified when new listings are added' },
    { key: 'priceDrops', label: 'Price drops', sub: 'Alerts when prices change on saved items' },
    { key: 'interestUpdates', label: 'Interest updates', sub: 'Updates on your lodge interest requests' },
    { key: 'messages', label: 'Messages', sub: 'New messages from landlords and vendors' },
    { key: 'promos', label: 'Promotions', sub: 'Deals and offers near campus' },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Notifications</h2>

      {/* Master toggle — synced with backend */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2">Global</p>
      <SectionCard>
        <div className="flex items-center px-5 py-4 gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shadow-sm">
            <Icon name="notifications" size={20} style={{ color: '#f97316' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-cx-ink">Enable notifications</p>
            <p className="text-xs font-medium text-cx-muted mt-0.5">
              {loading ? 'Saving...' : 'Master switch for all app notifications'}
            </p>
          </div>
          <Toggle on={masterOn} onToggle={handleMasterToggle} />
        </div>
      </SectionCard>

      {/* Local preference toggles */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2">Notification types</p>
      <SectionCard>
        {localItems.map((item, i) => (
          <div key={item.key}>
            <div
              className={`flex items-center px-5 py-4 gap-4 transition-colors cursor-pointer ${masterOn ? 'hover:bg-slate-50' : 'opacity-50 pointer-events-none'}`}
              onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: item.key })}
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-cx-ink">{item.label}</p>
                <p className="text-xs font-medium text-cx-muted mt-0.5">{item.sub}</p>
              </div>
              <Toggle on={settings[item.key] && masterOn} onToggle={() => dispatch({ type: 'TOGGLE_SETTING', key: item.key })} />
            </div>
            {i < localItems.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>

      <p className="text-xs text-cx-muted px-2 -mt-2">
        Type-level preferences are stored locally. Turn off the master toggle to silence all notifications from the server.
      </p>
    </div>
  );
}

