import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { useUpdateProfileMutation, useUpdateNotificationsMutation, useLogoutMutation, useGetMeQuery, useGetSchoolByIdQuery } from '../store/apiSlice';
import { Toggle } from '../components/Toggle.jsx';
import { Icon } from '../components/Icon.jsx';

const CAMPUS_OPTIONS = ['Crystal Campus', 'Lagos State University', 'University of Ibadan', 'OAU Campus'];
const CURRENCY_OPTIONS = ['₦ Naira', '$ US Dollar', '€ Euro', '£ Pound'];
const DISTANCE_OPTIONS = ['Kilometres', 'Miles'];
const LANGUAGE_OPTIONS = ['English', 'Yoruba', 'Igbo', 'Hausa'];

const DESKTOP_SECTIONS = [
  { key: 'editProfile', label: 'Edit profile', icon: 'edit', color: '#14b8a6', bg: '#e2f7f3' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications', color: '#f97316', bg: '#ffedd5' },
  { key: 'privacy', label: 'Privacy & security', icon: 'lock', color: '#8b5cf6', bg: '#ede9fe' },
  { key: 'preferences', label: 'Preferences', icon: 'tune', color: '#ec4899', bg: '#fce7f3' },
  { key: 'payment', label: 'Payment methods', icon: 'payments', color: '#f59e0b', bg: '#fef3c7' },
  { key: 'verification', label: 'Verification', icon: 'verified_user', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'help', label: 'Help & support', icon: 'help_outline', color: '#0ea5e9', bg: '#e0f2fe' },
  { key: 'about', label: 'About', icon: 'info', color: '#64748b', bg: '#f1f5f9' },
];

// ---------- Shared UI Components ----------

function BackButton({ onClick }) {
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

function RowItem({ icon, label, sub, onClick, right, color = '#5b6270', bg = '#f4f5f7' }) {
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

function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-3xl border border-cx-border overflow-hidden mb-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-b border-cx-border mx-5" />;
}

function InputField({ label, type = 'text', value, onChange, placeholder = '', disabled = false }) {
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

function SaveButton({ onClick, loading, label = 'Save changes' }) {
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

function EditProfileView({ user, onSave }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phone: user?.phone?.toString() || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);

  function onField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    await onSave({
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      phone: form.phone ? parseInt(form.phone.replace(/\D/g, '')) : undefined,
      bio: form.bio,
    });
    setLoading(false);
  }

  const initial = form.firstName?.charAt(0) || 'U';

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Edit profile</h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        {user?.profileImage?.url ? (
          <img
            src={user.profileImage.url}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-3 shadow-md border-4 border-white"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold mb-3 shadow-md border-4 border-white"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
          >
            {initial}
          </div>
        )}
        <button className="text-cx-teal text-sm font-bold border-none bg-transparent cursor-pointer hover:underline transition-all">
          Change photo
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First name"
            value={form.firstName}
            onChange={e => onField('firstName', e.target.value)}
          />
          <InputField
            label="Last name"
            value={form.lastName}
            onChange={e => onField('lastName', e.target.value)}
          />
        </div>
        <InputField
          label="Username"
          value={form.username}
          onChange={e => onField('username', e.target.value)}
          placeholder="e.g. amara_o"
        />
        <InputField
          type="tel"
          label="Phone number"
          value={form.phone}
          onChange={e => onField('phone', e.target.value)}
          placeholder="+234 xxx xxx xxxx"
        />

        <div>
          <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => onField('bio', e.target.value)}
            rows={3}
            placeholder="Tell the campus about yourself..."
            className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all resize-none shadow-sm"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Email — read-only, shown from API */}
        <div>
          <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">School email</label>
          <div className="flex items-center gap-3 w-full rounded-2xl border border-cx-border bg-slate-100 px-4 py-3.5 shadow-sm">
            <span className="text-sm font-medium text-cx-muted flex-1">{user?.email || '—'}</span>
            {user?.emailVerified ? (
              <div className="flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                <Icon name="verified" size={14} fill={1} style={{ color: '#14b8a6' }} />
                <span className="text-xs font-bold text-teal-600">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <Icon name="warning" size={14} style={{ color: '#d97706' }} />
                <span className="text-xs font-bold text-amber-600">Unverified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveButton onClick={handleSave} loading={loading} />
    </div>
  );
}

function NotificationsView({ user, onUpdateNotifications }) {
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

function PrivacyView({ onSave }) {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { state, dispatch, showToast } = useApp();
  const { settings } = state;

  async function handlePasswordSave() {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      showToast('Please fill in all password fields.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match.');
      return;
    }
    if (passwords.newPass.length < 8) {
      showToast('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    // Password change endpoint is not yet available in the API — show informational toast
    await new Promise(r => setTimeout(r, 800));
    showToast('Password change coming soon — contact support for now.');
    setLoading(false);
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Privacy & Security</h2>

      <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2">Data & Visibility</p>
      <SectionCard>
        <div className="flex items-center px-5 py-4 gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'locationServices' })}>
          <div className="flex-1">
            <p className="text-sm font-bold text-cx-ink">Location services</p>
            <p className="text-xs font-medium text-cx-muted mt-0.5">Allow Camproxi to access your location</p>
          </div>
          <Toggle on={settings.locationServices} onToggle={() => dispatch({ type: 'TOGGLE_SETTING', key: 'locationServices' })} />
        </div>
        <Divider />
        <div className="flex items-center px-5 py-4 gap-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showActivity' })}>
          <div className="flex-1">
            <p className="text-sm font-bold text-cx-ink">Show activity status</p>
            <p className="text-xs font-medium text-cx-muted mt-0.5">Let others see when you were last active</p>
          </div>
          <Toggle on={settings.showActivity} onToggle={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showActivity' })} />
        </div>
      </SectionCard>

      <div className="mt-4">
        <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-1 mb-2">Change password</p>
        <SectionCard className="p-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">Current password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">New password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">Confirm new password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <SaveButton onClick={handlePasswordSave} loading={loading} label="Update password" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function VerificationView({ user, school }) {
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

export function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, showToast } = useApp();
  const { settings, prefs } = state;

  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || userResponse;

  // Fetch school info using schoolId from the user profile
  const { data: schoolRes, isLoading: isLoadingSchool } = useGetSchoolByIdQuery(
    user?.schoolId,
    { skip: !user?.schoolId }
  );
  const school = schoolRes?.data || schoolRes;

  const [updateProfileApi] = useUpdateProfileMutation();
  const [updateNotificationsApi] = useUpdateNotificationsMutation();
  const [logoutApi] = useLogoutMutation();

  const v = searchParams.get('v') || 'main';

  function goTo(view) { setSearchParams({ v: view }); }
  function goBack() { setSearchParams({ v: 'main' }); }
  function handlePref(key, value) { dispatch({ type: 'SET_PREF', key, value }); }

  async function handleSaveProfile(payload) {
    try {
      await updateProfileApi(payload).unwrap();
      showToast('✓ Profile updated successfully!');
    } catch (e) {
      console.error(e);
      showToast('Failed to save profile. Please try again.');
    }
  }

  async function handleUpdateNotifications(enabled) {
    try {
      await updateNotificationsApi(enabled).unwrap();
      showToast(enabled ? '✓ Notifications enabled' : 'Notifications disabled');
    } catch (e) {
      console.error(e);
      showToast('Failed to update notification setting.');
    }
  }

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      dispatch({ type: 'LOGOUT' });
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.href = '/login';
    }
  }

  function renderSubView(view) {
    if (isLoadingUser && ['editProfile', 'verification', 'notifications'].includes(view)) {
      return (
        <div className="flex flex-col gap-4 animate-pulse pt-4">
          <div className="h-8 bg-slate-100 rounded-2xl w-48" />
          <div className="h-40 bg-slate-100 rounded-2xl w-full" />
          <div className="h-12 bg-slate-100 rounded-2xl w-full" />
        </div>
      );
    }

    switch (view) {
      case 'editProfile':
        return <EditProfileView user={user} onSave={handleSaveProfile} />;
      case 'notifications':
        return <NotificationsView user={user} onUpdateNotifications={handleUpdateNotifications} />;
      case 'privacy':
        return <PrivacyView />;
      case 'verification':
        return <VerificationView user={user} school={school} />;
      case 'payment':
        return <PaymentView />;
      case 'help':
        return <HelpView />;
      case 'about':
        return <AboutView />;
      case 'preferences':
        return <PreferencesView prefs={prefs} onPref={handlePref} school={school} isLoadingSchool={isLoadingSchool} />;
      case 'select-campus':
        return <SelectPage title="Campus region" options={CAMPUS_OPTIONS} selected={prefs.campus} onSelect={val => handlePref('campus', val)} onBack={goBack} />;
      case 'select-currency':
        return <SelectPage title="Currency" options={CURRENCY_OPTIONS} selected={prefs.currency} onSelect={val => handlePref('currency', val)} onBack={goBack} />;
      case 'select-distance':
        return <SelectPage title="Distance" options={DISTANCE_OPTIONS} selected={prefs.distance} onSelect={val => handlePref('distance', val)} onBack={goBack} />;
      case 'select-language':
        return <SelectPage title="Language" options={LANGUAGE_OPTIONS} selected={prefs.language} onSelect={val => handlePref('language', val)} onBack={goBack} />;
      default:
        return null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-2 md:py-8 px-4">
      {/* === MOBILE === */}
      <div className="md:hidden">
        {v === 'main' ? (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-cx-border shadow-sm cursor-pointer active:scale-95 transition-all"
              >
                <Icon name="arrow_back" size={20} style={{ color: '#42474f' }} />
              </button>
              <h1 className="text-2xl font-extrabold text-cx-ink">Settings</h1>
            </div>

            {/* Account */}
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Account</p>
            <SectionCard>
              <RowItem icon="edit" label="Edit profile" color="#14b8a6" bg="#e2f7f3" onClick={() => goTo('editProfile')} />
              <Divider />
              <RowItem icon="verified_user" label="Verification" color="#3b82f6" bg="#dbeafe"
                sub={user?.emailVerified ? 'Email verified ✓' : 'Email not verified'}
                onClick={() => goTo('verification')} />
              <Divider />
              <RowItem icon="payments" label="Payment methods" color="#f59e0b" bg="#fef3c7" onClick={() => goTo('payment')} />
            </SectionCard>

            {/* Preferences */}
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Preferences</p>
            <SectionCard>
              <RowItem
                icon="school"
                label="Campus region"
                sub={isLoadingSchool ? 'Loading…' : (school?.name || school?.schoolName || prefs.campus)}
                color="#0d9488" bg="#e2f7f3"
                right={<Icon name="lock" size={18} style={{ color: '#94a3b8' }} />}
              />
              <Divider />
              <RowItem icon="currency_exchange" label="Currency" sub={prefs.currency} color="#10b981" bg="#d1fae5" onClick={() => goTo('select-currency')} />
              <Divider />
              <RowItem icon="straighten" label="Distance" sub={prefs.distance} color="#8b5cf6" bg="#ede9fe" onClick={() => goTo('select-distance')} />
              <Divider />
              <RowItem icon="language" label="Language" sub={prefs.language} color="#f97316" bg="#ffedd5" onClick={() => goTo('select-language')} />
            </SectionCard>

            {/* Notifications */}
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Notifications</p>
            <SectionCard>
              <RowItem icon="notifications" label="Notification settings" color="#f97316" bg="#ffedd5"
                sub={user?.notificationsEnabled ? 'Enabled' : 'Disabled'}
                onClick={() => goTo('notifications')} />
            </SectionCard>

            {/* Privacy */}
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Privacy & Security</p>
            <SectionCard>
              <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'locationServices' })}>
                <span className="text-sm font-bold text-cx-ink">Location services</span>
                <Toggle on={settings.locationServices} onToggle={() => dispatch({ type: 'TOGGLE_SETTING', key: 'locationServices' })} />
              </div>
              <Divider />
              <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showActivity' })}>
                <span className="text-sm font-bold text-cx-ink">Show activity status</span>
                <Toggle on={settings.showActivity} onToggle={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showActivity' })} />
              </div>
              <Divider />
              <RowItem icon="lock" label="Change password" color="#64748b" bg="#f1f5f9" onClick={() => goTo('privacy')} />
            </SectionCard>

            {/* Support */}
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Support</p>
            <SectionCard>
              <RowItem icon="help_outline" label="Help center" color="#0ea5e9" bg="#e0f2fe" onClick={() => goTo('help')} />
              <Divider />
              <RowItem icon="flag" label="Report a problem" color="#ef4444" bg="#fee2e2" onClick={() => goTo('help')} />
              <Divider />
              <RowItem icon="description" label="Terms & Privacy" color="#3b82f6" bg="#dbeafe" onClick={() => goTo('about')} />
              <Divider />
              <RowItem icon="info" label="About Camproxi" color="#64748b" bg="#f1f5f9" onClick={() => goTo('about')} />
            </SectionCard>

            <div className="px-2 mt-4 mb-8">
              <button
                onClick={handleLogout}
                className="group w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-base cursor-pointer transition-all border-none shadow-sm hover:shadow-md active:scale-95"
                style={{ background: '#fee2e2', color: '#dc2626' }}
              >
                <div className="transition-transform group-hover:-translate-x-1">
                  <Icon name="logout" size={20} style={{ color: 'currentColor' }} />
                </div>
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <BackButton onClick={goBack} />
            {renderSubView(v)}
          </div>
        )}
      </div>

      {/* === DESKTOP === */}
      <div className="hidden md:flex gap-8">
        {/* Sticky Sidebar */}
        <aside className="flex-none w-72 sticky top-24 self-start">
          <h1 className="text-2xl font-extrabold text-cx-ink mb-6 px-2">Settings</h1>
          <div className="bg-white rounded-3xl border border-cx-border overflow-hidden shadow-sm flex flex-col p-2 gap-1">
            {DESKTOP_SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => goTo(section.key)}
                className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none cursor-pointer text-left transition-all"
                style={{ background: v === section.key ? section.bg : 'transparent' }}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform ${v === section.key ? 'scale-100 shadow-sm' : 'scale-95 group-hover:scale-100'}`}
                  style={{ background: v === section.key ? 'white' : section.bg }}
                >
                  <Icon
                    name={section.icon}
                    size={18}
                    fill={v === section.key ? 1 : 0}
                    style={{ color: section.color }}
                  />
                </div>
                <span className="text-sm font-bold flex-1" style={{ color: v === section.key ? section.color : '#42474f' }}>
                  {section.label}
                </span>
                {v === section.key && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: section.color }} />
                )}
              </button>
            ))}

            <div className="my-2 border-b border-cx-border mx-4" />

            <button
              onClick={handleLogout}
              className="group w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-none bg-transparent cursor-pointer text-left transition-all hover:bg-red-50"
            >
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center transition-transform group-hover:scale-105">
                <Icon name="logout" size={18} style={{ color: '#dc2626' }} />
              </div>
              <span className="text-sm font-bold flex-1" style={{ color: '#dc2626' }}>Log out</span>
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-cx-border p-8 max-w-[680px] shadow-sm min-h-[600px]">
            {renderSubView(v === 'main' ? 'editProfile' : v) || (
              <EditProfileView user={user} onSave={handleSaveProfile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
