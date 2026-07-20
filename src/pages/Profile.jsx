import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { useLogoutMutation, useGetMeQuery, useGetSavedItemsQuery, useGetSchoolByIdQuery, useGetRequestsQuery } from '../store/apiSlice';
import { Icon } from '../components/Icon.jsx';

const MENU_ITEMS = [
  { icon: 'edit', label: 'Edit profile', route: '/settings?v=editProfile', color: '#14b8a6', bg: '#e2f7f3' },
  { icon: 'settings', label: 'Settings', route: '/settings', color: '#7c6cf0', bg: '#ecebfe' },
  { icon: 'payments', label: 'Payment methods', route: '/settings?v=payment', color: '#f59e0b', bg: '#fef3c7' },
  { icon: 'verified_user', label: 'Verification', route: '/settings?v=verification', color: '#3b82f6', bg: '#dbeafe' },
  { icon: 'help_outline', label: 'Help & support', route: '/settings?v=help', color: '#ec4899', bg: '#fce7f3' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #14b8a6, #7c6cf0)', // Teal to Purple
  'linear-gradient(135deg, #f43f5e, #f59e0b)', // Rose to Amber
  'linear-gradient(135deg, #3b82f6, #8b5cf6)', // Blue to Violet
  'linear-gradient(135deg, #10b981, #3b82f6)', // Emerald to Blue
  'linear-gradient(135deg, #ec4899, #8b5cf6)', // Pink to Violet
  'linear-gradient(135deg, #f97316, #eab308)', // Orange to Yellow
];

function getGradient(str) {
  if (!str) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Profile() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { activity } = state;

  const { data: userResponse, isLoading: isLoadingUser } = useGetMeQuery();
  const user = userResponse?.data || userResponse;

  const { data: savedItemsRes } = useGetSavedItemsQuery();
  const savedItems = Array.isArray(savedItemsRes) ? savedItemsRes : (savedItemsRes?.data || []);
  const savedCount = savedItems.length;

  // Fetch school info from /api/admin/school/:schoolId
  const { data: schoolRes, isLoading: isLoadingSchool } = useGetSchoolByIdQuery(
    user?.schoolId,
    { skip: !user?.schoolId }
  );
  const school = schoolRes?.data || schoolRes;
  const schoolName = school ? `${school.code} ${school.campus?.[0]?.name || ''}`.trim() : null;

  const { data: requestsRes } = useGetRequestsQuery();
  const rawRequests = Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []);
  const interestCount = rawRequests.length;

  const [logoutApi] = useLogoutMutation();

  async function handleLogout() {
    try {
      await logoutApi().unwrap();
      dispatch({ type: 'LOGOUT' }); // Clear legacy context
    } catch (e) {
      console.error('Logout failed', e);
    }
  }

  const name = user ? `${user.firstName} ${user.lastName}` : 'Loading...';
  const email = user ? user.email : 'Loading...';
  const initial = user?.firstName?.charAt(0) || 'U';
  const userGradient = getGradient(user?.firstName || 'U');

  return (
    <div className="max-w-5xl mx-auto py-2 md:py-8">
      
      {/* Two-Column Split wrapper */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        
        {/* Left Column: Profile Card + Stats */}
        <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col gap-6">
          
          {/* Profile Banner Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm border border-cx-border bg-white">
            {/* Gradient Background */}
            <div 
              className="h-32 w-full"
              style={{ background: userGradient }}
            ></div>
            
            {/* User Info Overlay */}
            <div className="px-6 pb-6 relative -mt-12 flex flex-col items-center text-center">
              {/* Avatar */}
              <div 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-extrabold mb-4 overflow-hidden relative z-10 bg-white"
                style={{ background: user?.profileImage?.url ? 'transparent' : userGradient }}
              >
                {user?.profileImage?.url ? (
                  <img src={user.profileImage.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              
              {isLoadingUser ? (
                <>
                  <div className="h-6 bg-cx-bg rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-4 bg-cx-bg rounded w-48 animate-pulse"></div>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-extrabold text-cx-ink mb-0.5">{name}</h1>
                  {user?.username && <p className="text-sm font-bold text-cx-teal mb-1">@{user.username}</p>}
                  <p className="text-sm text-cx-muted mb-3">{email}</p>

                  {user?.bio && (
                    <p className="text-sm text-cx-ink3 leading-relaxed mb-4 px-4 max-w-sm">
                      {user.bio}
                    </p>
                  )}

                  {/* School name */}
                  {isLoadingSchool ? (
                    <div className="h-4 bg-cx-bg rounded-full w-32 animate-pulse mb-3" />
                  ) : (user?.school || schoolName) ? (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Icon name="school" size={14} fill={1} style={{ color: '#9aa0ab' }} />
                      <span className="text-xs font-semibold text-cx-muted">{user?.school || schoolName}</span>
                    </div>
                  ) : null}

                  {user?.phone && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <Icon name="call" size={14} style={{ color: '#9aa0ab' }} />
                      <span className="text-xs font-semibold text-cx-muted">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm" style={{ background: '#e2f7f3', borderColor: '#ccf0eb' }}>
                    <Icon name="verified_user" size={14} fill={1} style={{ color: '#14b8a6' }} />
                    <span className="text-xs font-bold text-teal-600" style={{ color: '#0d9488' }}>Verified Student</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Saved', value: savedCount },
              { label: 'Interests', value: interestCount },
              { label: 'Reviews', value: 0 },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="bg-white rounded-2xl border border-cx-border p-4 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 cursor-default"
              >
                <p className="text-2xl font-extrabold text-cx-ink">{stat.value}</p>
                <p className="text-xs font-semibold text-cx-muted mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Menu + Logout */}
        <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col gap-6 mt-2 md:mt-0">
          
          <h2 className="text-lg font-bold text-cx-ink hidden md:block px-2">Account Settings</h2>
          
          <div className="bg-white rounded-3xl border border-cx-border overflow-hidden shadow-sm flex flex-col">
            {MENU_ITEMS.map((item, i) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className="group w-full flex items-center gap-4 px-5 py-4 cursor-pointer border-none bg-white text-left hover:bg-slate-50 transition-colors"
                style={{ borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid #ebedf0' : 'none' }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm"
                  style={{ background: item.bg }}
                >
                  <Icon name={item.icon} size={20} style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-base font-bold text-cx-ink">{item.label}</span>
                <div className="transition-transform group-hover:translate-x-1">
                  <Icon name="chevron_right" size={20} style={{ color: '#9aa0ab' }} />
                </div>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mt-2 pb-6 md:pb-0">
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

      </div>
    </div>
  );
}
