import React, { useState } from 'react';
import { Icon } from '../Icon';

export function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  right,
}) {
  return (
    <div className='relative'>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className='w-full rounded-xl border border-cx-border bg-cx-input px-4 py-3 text-sm text-cx-ink placeholder-cx-muted outline-none focus:border-cx-teal transition-colors'
        style={{ fontFamily: 'inherit', paddingRight: right ? 44 : 16 }}
      />
      {right && (
        <div className='absolute right-3 top-1/2 -translate-y-1/2'>
          {right}
        </div>
      )}
    </div>
  );
}

export function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      right={
        <button
          type='button'
          onClick={() => setShow((s) => !s)}
          className='border-none bg-transparent cursor-pointer p-0 flex items-center'
        >
          <Icon
            name={show ? 'visibility_off' : 'visibility'}
            size={18}
            style={{ color: '#9aa0ab' }}
          />
        </button>
      }
    />
  );
}
