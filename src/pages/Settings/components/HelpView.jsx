import React, { useState } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, Divider } from './SharedUI.jsx';

export function HelpView() {
  const [query, setQuery] = useState('');
  const topics = [
    'How to show interest in a lodge',
    'Tracking my order/request',
    'Contacting a landlord or vendor',
    'Saving and managing listings',
    'Updating my profile information',
    'How notifications work',
    'Reporting a listing or user',
  ];
  const filtered = topics.filter(t => t.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Help & Support</h2>

      <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-cx-border px-4 py-3.5 mb-8 shadow-sm focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-cx-teal transition-all">
        <Icon name="search" size={20} style={{ color: '#9aa0ab' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search help topics..."
          className="flex-1 text-sm font-medium text-cx-ink placeholder-cx-muted bg-transparent outline-none border-none"
          style={{ fontFamily: 'inherit' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="border-none bg-transparent cursor-pointer">
            <Icon name="close" size={16} style={{ color: '#9aa0ab' }} />
          </button>
        )}
      </div>

      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide mb-2 px-1">
        {query ? `Results for "${query}"` : 'Popular topics'}
      </p>

      {filtered.length > 0 ? (
        <SectionCard>
          {filtered.map((t, i) => (
            <div key={t}>
              <button className="group w-full flex items-center justify-between px-5 py-4 border-none bg-white cursor-pointer hover:bg-slate-50 text-left transition-colors">
                <span className="text-sm font-bold text-cx-ink group-hover:text-cx-teal transition-colors">{t}</span>
                <div className="transition-transform group-hover:translate-x-1">
                  <Icon name="chevron_right" size={20} style={{ color: '#9aa0ab' }} />
                </div>
              </button>
              {i < filtered.length - 1 && <Divider />}
            </div>
          ))}
        </SectionCard>
      ) : (
        <div className="text-center py-10 text-cx-muted">
          <Icon name="search_off" size={32} style={{ color: '#9aa0ab' }} />
          <p className="mt-2 text-sm font-medium">No topics found</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          className="py-4 rounded-2xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 border-none shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          style={{ color: '#0d9488', background: '#ccfbf1' }}
        >
          <Icon name="chat_bubble" size={18} />
          Live chat
        </button>
        <button
          className="py-4 rounded-2xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2 border border-cx-border bg-white text-cx-ink3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:bg-slate-50"
        >
          <Icon name="call" size={18} />
          Call us
        </button>
      </div>
    </div>
  );
}
