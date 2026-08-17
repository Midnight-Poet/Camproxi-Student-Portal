import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context.jsx';
import { useUpdateProfileMutation, useUpdateNotificationsMutation, useLogoutMutation, useGetMeQuery, useGetSchoolByIdQuery } from '../../store/apiSlice';
import { Toggle } from '../../components/Toggle.jsx';
import { Icon } from '../../components/Icon.jsx';

const CAMPUS_OPTIONS = ['Crystal Campus', 'Lagos State University', 'University of Ibadan', 'OAU Campus'];
const CURRENCY_OPTIONS = ['₦ Naira', '$ US Dollar', '€ Euro', '£ Pound'];
const DISTANCE_OPTIONS = ['Kilometres', 'Miles'];
const LANGUAGE_OPTIONS = ['English', 'Yoruba', 'Igbo', 'Hausa'];

const DESKTOP_SECTIONS = [
  { key: 'editProfile', label: 'Edit profile', icon: 'edit', color: '#14b8a6', bg: '#e2f7f3' },
  { key: 'reviews', label: 'My reviews', icon: 'rate_review', color: '#f59e0b', bg: '#fef3c7' },
  // { key: 'notifications', label: 'Notifications', icon: 'notifications', color: '#f97316', bg: '#ffedd5' },
  { key: 'privacy', label: 'Privacy & security', icon: 'lock', color: '#8b5cf6', bg: '#ede9fe' },
  { key: 'verification', label: 'Verification', icon: 'verified_user', color: '#3b82f6', bg: '#dbeafe' },
  { key: 'reports', label: 'My reports', icon: 'assignment_turned_in', color: '#10b981', bg: '#d1fae5' },
  { key: 'about', label: 'About', icon: 'info', color: '#64748b', bg: '#f1f5f9' },
];

// ---------- Shared UI Components ----------


import { BackButton, RowItem, SectionCard, Divider } from './components/SharedUI.jsx';
import { EditProfileView } from './components/EditProfileView.jsx';
import { NotificationsView } from './components/NotificationsView.jsx';
import { PrivacyView } from './components/PrivacyView.jsx';
import { VerificationView } from './components/VerificationView.jsx';
import { HelpView } from './components/HelpView.jsx';
import { AboutView } from './components/AboutView.jsx';
import { ReportsView } from './components/ReportsView.jsx';
import { MyReviewsView } from './components/MyReviewsView.jsx';
import { ReportModal } from '../../components/ReportModal.jsx';

export function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state, dispatch, showToast } = useApp();
  const { settings, prefs } = state;
  const [isReportModalOpen, setReportModalOpen] = useState(false);

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
      case 'reviews':
        return <MyReviewsView goBack={goBack} />;
      // case 'notifications':
      //   return <NotificationsView user={user} onUpdateNotifications={handleUpdateNotifications} />;
      case 'privacy':
        return <PrivacyView />;
      case 'verification':
        return <VerificationView user={user} school={school} />;
      case 'reports':
        return <ReportsView goBack={goBack} onOpenReportModal={() => setReportModalOpen(true)} />;
      case 'about':
        return <AboutView />;
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
              <RowItem icon="rate_review" label="My reviews & ratings" color="#f59e0b" bg="#fef3c7" onClick={() => goTo('reviews')} />
              <Divider />
              <RowItem icon="verified_user" label="Verification" color="#3b82f6" bg="#dbeafe"
                sub={user?.emailVerified ? 'Email verified ✓' : 'Email not verified'}
                onClick={() => goTo('verification')} />
            </SectionCard>

            {/* Notifications (commented out for now) */}
            {/* 
            <p className="text-xs font-bold text-cx-ink3 uppercase tracking-wide px-2 mb-2">Notifications</p>
            <SectionCard>
              <RowItem icon="notifications" label="Notification settings" color="#f97316" bg="#ffedd5"
                sub={user?.notificationsEnabled ? 'Enabled' : 'Disabled'}
                onClick={() => goTo('notifications')} />
            </SectionCard> 
            */}

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
              <RowItem icon="assignment_turned_in" label="My submitted reports" color="#10b981" bg="#d1fae5" onClick={() => goTo('reports')} />
              <Divider />
              <RowItem icon="flag" label="Report a problem" color="#ef4444" bg="#fee2e2" onClick={() => setReportModalOpen(true)} />
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

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="GENERAL"
      />
    </div>
  );
}
