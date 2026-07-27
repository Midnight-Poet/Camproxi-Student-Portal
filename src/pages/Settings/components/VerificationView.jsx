import React from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, RowItem } from './SharedUI.jsx';

export function VerificationView({ user, school }) {
  const verified = user?.emailVerified;
  const phoneVerified = user?.phoneVerified;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';
  const schoolName = school?.name || school?.schoolName || null;

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Verification</h2>

      {/* Status Banner */}
      <div
        className="rounded-3xl p-5 flex items-center gap-4 mb-6 shadow-sm"
        style={verified
          ? { background: 'linear-gradient(135deg, #ccfbf1, #e0f2fe)', border: '1px solid #bceae4' }
          : { background: 'linear-gradient(135deg, #fef9c3, #fde68a20)', border: '1px solid #fcd34d' }
        }
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${verified ? 'bg-white' : 'bg-amber-50'}`}>
          <Icon name={verified ? 'verified_user' : 'pending'} size={28} fill={1} style={{ color: verified ? '#0d9488' : '#d97706' }} />
        </div>
        <div>
          <p className={`font-extrabold text-base ${verified ? 'text-teal-800' : 'text-amber-800'}`}>
            {verified ? 'Verified Student' : 'Verification Pending'}
          </p>
          <p className={`text-sm font-medium ${verified ? 'text-teal-700' : 'text-amber-700'}`}>
            {verified ? 'Your student status has been confirmed' : 'Your school email is not yet verified'}
          </p>
        </div>
      </div>

      {/* Verification Details */}
      <SectionCard>
        {[
          { label: 'School email', value: user?.email || '—', verified: user?.emailVerified },
          { label: 'Phone number', value: user?.phone ? `+${user.phone}` : '—', verified: user?.phoneVerified },
          { label: 'School', value: schoolName || '—' },
          { label: 'Member since', value: memberSince },
          { label: 'Username', value: user?.username ? `@${user.username}` : '—' },
        ].map((row, i, arr) => (
          <div key={row.label}>
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-bold text-cx-muted">{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-cx-ink">{row.value}</span>
                {row.verified === true && (
                  <Icon name="verified" size={16} fill={1} style={{ color: '#14b8a6' }} />
                )}
                {row.verified === false && (
                  <Icon name="warning" size={16} style={{ color: '#d97706' }} />
                )}
              </div>
            </div>
            {i < arr.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>

      {!verified && (
        <button
          className="w-full py-4 rounded-full font-bold text-base border-none cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
          style={{ background: '#fef3c7', color: '#92400e' }}
        >
          Resend verification email
        </button>
      )}
    </div>
  );
}

function PaymentView() {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Payment methods</h2>

      <SectionCard>
        {[
          { icon: 'credit_card', label: 'Visa •••• 4231', sub: 'Expires 09/26', color: '#1d4ed8', bg: '#dbeafe' },
          { icon: 'account_balance', label: 'GTBank transfer', sub: 'Linked bank account', color: '#ea580c', bg: '#ffedd5' },
        ].map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
              <div
                className="w-12 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: item.bg }}
              >
                <Icon name={item.icon} size={22} style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-cx-ink">{item.label}</p>
                <p className="text-xs font-medium text-cx-muted">{item.sub}</p>
              </div>
              <button className="text-xs font-bold text-cx-muted border-none bg-transparent cursor-pointer hover:text-red-500 transition-colors">
                Remove
              </button>
            </div>
            {i === 0 && <Divider />}
          </div>
        ))}
      </SectionCard>

      <button
        className="group w-full py-4 rounded-full font-bold text-base border-none cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 transition-all"
        style={{ color: '#0d9488', background: '#ccfbf1' }}
      >
        <div className="transition-transform group-hover:rotate-90">
          <Icon name="add" size={20} />
        </div>
        Add payment method
      </button>

      <p className="text-xs font-medium text-cx-muted text-center mt-4 px-4 flex items-center justify-center gap-1.5">
        <Icon name="lock" size={14} /> Your payment information is encrypted and secure.
      </p>
    </div>
  );
}

function HelpView() {
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

function AboutView() {
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

function PreferencesView({ prefs, onPref, school, isLoadingSchool }) {
  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-2">Preferences</h2>
      <p className="text-sm text-cx-muted mb-6 px-1">These preferences are stored locally on your device.</p>

      {/* Campus — read-only, comes from backend */}
      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide mb-2 px-1">Campus region</p>
      <SectionCard>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#e2f7f3' }}>
            <Icon name="school" size={20} style={{ color: '#0d9488' }} />
          </div>
          <div className="flex-1">
            {isLoadingSchool ? (
              <div className="h-4 bg-cx-bg rounded w-36 animate-pulse" />
            ) : (
              <p className="text-sm font-bold text-cx-ink">
                {school?.name || school?.schoolName || prefs.campus}
              </p>
            )}
            <p className="text-xs font-medium text-cx-muted mt-0.5">Assigned at registration — cannot be changed</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <Icon name="lock" size={16} style={{ color: '#94a3b8' }} />
          </div>
        </div>
      </SectionCard>

      {/* Other local prefs */}
      {[
        { key: 'currency', label: 'Currency', options: CURRENCY_OPTIONS },
        { key: 'distance', label: 'Distance units', options: DISTANCE_OPTIONS },
        { key: 'language', label: 'Language', options: LANGUAGE_OPTIONS },
      ].map(pref => (
        <div key={pref.key} className="mb-6">
          <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide mb-2 px-1">{pref.label}</p>
          <SectionCard>
            <div className="flex flex-wrap gap-2.5 p-4">
              {pref.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => onPref(pref.key, opt)}
                  className="px-4 py-2 rounded-full text-xs font-bold cursor-pointer border transition-all active:scale-95"
                  style={{
                    background: prefs[pref.key] === opt ? '#14b8a6' : 'white',
                    color: prefs[pref.key] === opt ? 'white' : '#5b6270',
                    border: prefs[pref.key] === opt ? 'none' : '1.5px solid #ebedf0',
                    boxShadow: prefs[pref.key] === opt ? '0 2px 4px rgba(20, 184, 166, 0.2)' : 'none',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      ))}
    </div>
  );
}

function SelectPage({ title, options, selected, onSelect, onBack }) {
  return (
    <div className="animate-in fade-in duration-300">
      <BackButton onClick={onBack} />
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">{title}</h2>
      <SectionCard>
        {options.map((opt, i) => (
          <div key={opt}>
            <button
              onClick={() => { onSelect(opt); onBack(); }}
              className="w-full flex items-center justify-between px-5 py-4 border-none bg-white cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <span className={`text-sm ${selected === opt ? 'font-extrabold text-cx-teal' : 'font-semibold text-cx-ink'}`}>{opt}</span>
              {selected === opt && <Icon name="check" size={20} style={{ color: '#14b8a6' }} />}
            </button>
            {i < options.length - 1 && <Divider />}
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

// ---------- Main Settings Component ----------

