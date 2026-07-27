import React, { useState } from 'react';
import { Icon } from '../../../components/Icon.jsx';
import { SectionCard, InputField, SaveButton } from './SharedUI.jsx';
import { useApp } from '../../../context.jsx';

export function PrivacyView({ onSave }) {
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

