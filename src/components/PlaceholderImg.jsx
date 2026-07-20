export function PlaceholderImg({ label, className='', style={} }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background: 'repeating-linear-gradient(135deg, #eef0f3 0 11px, #e5e8ed 11px 22px)',
        ...style,
      }}
    >
      <span className="font-mono text-[10px] text-cx-muted2 tracking-wider text-center px-2">
        {label}
      </span>
    </div>
  );
}
