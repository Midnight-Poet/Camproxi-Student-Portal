export function Toggle({ on, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-none rounded-full border-none cursor-pointer p-0"
      style={{
        width: 46,
        height: 28,
        background: on ? '#14b8a6' : '#dfe1e6',
        transition: 'background .2s',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute rounded-full bg-white shadow"
        style={{
          top: 3,
          left: 3,
          width: 22,
          height: 22,
          transition: 'transform .2s',
          transform: on ? 'translateX(18px)' : 'none',
        }}
      />
    </button>
  );
}
