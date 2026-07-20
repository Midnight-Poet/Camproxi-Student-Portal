import { badgeConfig } from '../data.js';

export function Badge({ text, small=false }) {
  const { color, bg } = badgeConfig(text);
  return (
    <span
      className="inline-flex items-center rounded-full font-extrabold"
      style={{
        color,
        background: bg,
        padding: small ? '3px 8px' : '5px 10px',
        fontSize: small ? '10px' : '11px',
        lineHeight: 1.1,
      }}
    >
      {text}
    </span>
  );
}
