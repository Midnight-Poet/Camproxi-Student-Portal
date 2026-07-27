import React from 'react';

export function AvatarCircle({ name, size = 40, gradient = 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  return (
    <div
      className="flex-none flex items-center justify-center rounded-full text-white font-extrabold shadow-sm"
      style={{ width: size, height: size, background: gradient, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
