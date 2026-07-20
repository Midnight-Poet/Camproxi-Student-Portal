import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './store/authSlice';
import { useGetMeQuery } from './store/apiSlice';
import { AppProvider } from './context.jsx';

import { AppLayout } from './components/AppLayout.jsx';
import { Onboarding } from './pages/Onboarding.jsx';
import { Login } from './pages/Login.jsx';
import { Home } from './pages/Home.jsx';
import { Explore } from './pages/Explore.jsx';
import { Detail } from './pages/Detail.jsx';
import { Saved } from './pages/Saved.jsx';
import { Activity } from './pages/Activity.jsx';
import { Messages } from './pages/Messages.jsx';
import { Profile } from './pages/Profile.jsx';
import { Settings } from './pages/Settings.jsx';
import { Notifications } from './pages/Notifications.jsx';

function AuthGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function RootRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return <Navigate to={isAuthenticated ? '/home' : '/onboarding'} replace />;
}

export default function App() {
  const { data,isLoading } = useGetMeQuery();
  console.log(data)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cx-bg flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Outer glowing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-[#14b8a6]/20 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-[-20px] rounded-full border border-[#14b8a6]/10 animate-[spin_3s_linear_infinite]"></div>
          
          {/* Inner Logo */}
          <div className="w-16 h-16 bg-gradient-to-tr from-[#14b8a6] to-[#7c6cf0] rounded-2xl flex items-center justify-center shadow-xl z-10 animate-pulse" style={{ animationDuration: '2s' }}>
            <span className="text-white font-extrabold text-2xl tracking-tighter">CX</span>
          </div>
        </div>
        <p className="mt-8 font-bold text-[#1f2430] tracking-widest text-sm uppercase animate-pulse" style={{ animationDuration: '2s' }}>
          Loading
        </p>
      </div>
    );
  }

  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<PublicGuard><Onboarding /></PublicGuard>} />
        <Route path="/login" element={<PublicGuard><Login /></PublicGuard>} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/listing/:id" element={<Detail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}

