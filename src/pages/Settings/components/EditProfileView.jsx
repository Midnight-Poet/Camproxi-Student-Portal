import React, { useState } from 'react';
import { AvatarCircle } from '../../../components/ui';
import { Icon } from '../../../components/Icon.jsx';
import { InputField, SaveButton, SectionCard } from './SharedUI.jsx';

export function EditProfileView({ user, onSave }) {
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

