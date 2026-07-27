import React from 'react';

export function ProgressBar({ step, total = 2 }) {
  return (
    <div className='flex items-center gap-1.5'>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className='h-1.5 rounded-full transition-all duration-300 flex-1'
          style={{ background: i < step ? '#14b8a6' : '#e5e8ed' }}
        />
      ))}
    </div>
  );
}
