import React from 'react';
import { Icon } from '../Icon.jsx';

export function Field({ label, error, children }) {
  return (
    <div>
      <label className='text-xs font-bold text-cx-ink3 mb-1.5 block'>
        {label}
      </label>
      {children}
      {error && (
        <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
          <Icon name='error' size={12} style={{ color: '#ef4444' }} />
          {error}
        </p>
      )}
    </div>
  );
}
