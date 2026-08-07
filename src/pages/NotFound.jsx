import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cx-teal to-[#7c6cf0]"></div>
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#14b8a6]/5 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#7c6cf0]/5 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="w-24 h-24 mx-auto bg-[#e2f7f3] rounded-full flex items-center justify-center mb-6">
            <Icon name="search_off" size={48} style={{ color: '#14b8a6' }} />
          </div>
          
          <h1 className="text-6xl font-extrabold text-slate-900 mb-2">404</h1>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Page not found</h2>
          
          <p className="text-slate-500 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-[#14b8a6] to-[#0c8c81] text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-none cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#14b8a6]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#7c6cf0]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
