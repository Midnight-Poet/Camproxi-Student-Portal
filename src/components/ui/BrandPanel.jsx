import React from 'react';

export function BrandPanel({ headline, sub }) {
  return (
    <div
      className='hidden md:flex flex-col justify-between p-12'
      style={{
        width: '46%',
        background:
          'linear-gradient(160deg, #0c8c81 0%, #14b8a6 50%, #1aa5c8 100%)',
        minHeight: '100vh',
      }}
    >
      <div>
        <div className='flex items-center gap-3 mb-12'>
          <div 
            className='w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-[16px] tracking-tighter shadow-md'
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #7c6cf0 100%)' }}
          >
            CX
          </div>
          <span className='text-white font-extrabold text-xl tracking-tight'>
            Camproxi
          </span>
        </div>
        <h2 className='text-white text-3xl font-extrabold leading-tight mb-4'>
          {headline}
        </h2>
        <p className='text-white/80 text-base mb-8'>{sub}</p>
        <div className='flex flex-wrap gap-2'>
          {['Lodges', 'Food & Drinks', 'Groceries', 'Services'].map(
            (chip) => (
              <span
                key={chip}
                className='bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full'
              >
                {chip}
              </span>
            ),
          )}
        </div>
      </div>
      <p className='text-white/60 text-xs'>
        Built for students, by students.
      </p>
    </div>
  );
}
