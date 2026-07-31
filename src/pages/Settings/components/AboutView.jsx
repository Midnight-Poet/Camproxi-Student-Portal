import React from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, Divider } from './SharedUI.jsx';

export function AboutView() {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-8">About Camproxi</h2>

      <div className="flex flex-col items-center mb-8">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold mb-4 shadow-md"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0c8c81)' }}
        >
          C
        </div>
        <p className="font-extrabold text-cx-ink text-2xl">Camproxi</p>
        <p className="text-sm font-bold text-cx-muted mt-1 bg-slate-100 px-3 py-1 rounded-full">Version 1.0.0</p>
      </div>

      <SectionCard>
        {[
          { label: 'Terms of service', icon: 'description', color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Privacy policy', icon: 'privacy_tip', color: '#8b5cf6', bg: '#ede9fe' },
          { label: 'Rate Camproxi', icon: 'star', color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Open source licenses', icon: 'code', color: '#64748b', bg: '#f1f5f9' },
        ].map((item, i, arr) => (
          <div key={item.label}>
            <button className="group w-full flex items-center gap-4 px-5 py-4 border-none bg-white cursor-pointer hover:bg-slate-50 text-left transition-colors">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                style={{ background: item.bg }}
              >
                <Icon name={item.icon} size={20} style={{ color: item.color }} />
              </div>
              <span className="flex-1 text-sm font-bold text-cx-ink">{item.label}</span>
              <div className="transition-transform group-hover:translate-x-1">
                <Icon name="chevron_right" size={20} style={{ color: '#9aa0ab' }} />
              </div>
            </button>
            {i < arr.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>

      <p className="text-xs font-medium text-cx-muted text-center mt-6">© 2026 Camproxi. All rights reserved.</p>
    </div>
  );
}
