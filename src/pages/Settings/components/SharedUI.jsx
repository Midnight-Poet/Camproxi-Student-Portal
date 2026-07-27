import React from 'react';
import { Icon } from '../../../components/Icon.jsx';

export function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 text-sm font-bold text-cx-ink3 mb-6 border-none bg-transparent cursor-pointer hover:text-cx-teal transition-colors"
    >
      <div className="transition-transform group-hover:-translate-x-1 flex items-center">
        <Icon name="arrow_back" size={18} />
      </div>
      Back
    </button>
  );
}



export function RowItem({ icon, label, sub, onClick, right, color = '#5b6270', bg = '#f4f5f7' }) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-4 px-5 py-4 border-none bg-white cursor-pointer text-left hover:bg-slate-50 transition-colors"
    >
      {icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-none transition-transform group-hover:scale-105 shadow-sm"
          style={{ background: bg }}
        >
          <Icon name={icon} size={20} style={{ color }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-cx-ink">{label}</p>
        {sub && <p className="text-xs text-cx-muted mt-0.5">{sub}</p>}
      </div>
      <div className="transition-transform group-hover:translate-x-1 flex items-center">
        {right || <Icon name="chevron_right" size={20} style={{ color: '#9aa0ab' }} />}
      </div>
    </button>
  );
}



export function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl border border-cx-border overflow-hidden mb-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}



export function Divider() {
  return <div className="border-b border-cx-border mx-5" />;
}



export function InputField({ label, type = 'text', value, onChange, placeholder = '', disabled = false }) {
  return (
    <div>
      <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: 'inherit' }}
      />
    </div>
  );
}



export function SaveButton({ onClick, loading, label = 'Save changes' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-4 rounded-full text-white font-bold text-base border-none cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
      style={{ background: '#14b8a6' }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Saving...
        </span>
      ) : label}
    </button>
  );
}

// ---------- Sub-Views ----------



