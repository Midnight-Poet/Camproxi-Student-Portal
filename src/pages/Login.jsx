import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../store/apiSlice';
import { Icon } from '../components/Icon.jsx';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Failed to log in:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop: left panel */}
      <div
        className="hidden md:flex flex-col justify-between p-12"
        style={{
          width: '46%',
          background: 'linear-gradient(160deg, #0c8c81 0%, #14b8a6 50%, #1aa5c8 100%)',
          minHeight: '100vh',
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-extrabold text-cx-teal text-lg">
              C
            </div>
            <span className="text-white font-extrabold text-xl">Camproxi</span>
          </div>
          <h2 className="text-white text-3xl font-extrabold leading-tight mb-4">
            Welcome back to your campus
          </h2>
          <p className="text-white/80 text-base mb-8">
            Log in to continue exploring lodges, food, groceries and services near you.
          </p>
        </div>
        <p className="text-white/60 text-xs">Built for students, by students.</p>
      </div>

      {/* Right panel (full width on mobile) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-[420px] w-full mx-auto">
        <div className="flex flex-col">
          <button onClick={() => navigate('/onboarding')} className="w-9 h-9 rounded-full flex items-center justify-center bg-cx-bg border-none cursor-pointer mb-6">
            <Icon name="arrow_back" size={20} style={{ color: '#42474f' }} />
          </button>
          <h2 className="text-2xl font-extrabold text-cx-ink mb-1">Sign in</h2>
          <p className="text-cx-muted text-sm mb-6">Enter your email and password to access your account.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-bold text-cx-ink3 mb-1.5 block">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.ng"
                className="w-full rounded-xl border border-cx-border bg-cx-input px-4 py-3 text-sm text-cx-ink placeholder-cx-muted outline-none focus:border-cx-teal"
                style={{ fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-cx-ink3 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-cx-border bg-cx-input px-4 py-3 text-sm text-cx-ink placeholder-cx-muted outline-none focus:border-cx-teal"
                style={{ fontFamily: 'inherit' }}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2 font-medium">
                {error.data?.message || 'Login failed. Please check your credentials.'}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-base border-none cursor-pointer mt-6 disabled:opacity-50"
              style={{ background: '#14b8a6' }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-cx-muted mt-6">
            Don't have an account? <Link to="/onboarding" className="text-cx-teal font-semibold cursor-pointer">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
