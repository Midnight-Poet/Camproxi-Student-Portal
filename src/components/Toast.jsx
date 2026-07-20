import { useApp } from '../context.jsx';
import { Icon } from './Icon.jsx';

export function Toast() {
  const { state } = useApp();
  const toast = state.toast;
  const visible = !!toast;
  
  // Default to bottom if not specified
  const position = toast?.position || 'bottom';

  const positionClasses = position === 'top' 
    ? 'top-6' 
    : 'bottom-24';

  const hiddenTransform = position === 'top'
    ? 'translateX(-50%) translateY(-20px)'
    : 'translateX(-50%) translateY(12px)';

  return (
    <div
      className={`fixed ${positionClasses} left-1/2 z-[100] pointer-events-none w-full max-w-[90vw] md:max-w-md flex justify-center`}
      style={{
        transition: 'opacity 0.25s, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(-50%) translateY(0)' : hiddenTransform,
      }}
    >
      {visible && (
        <div className="flex items-center justify-center text-center gap-2 bg-cx-ink text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-lg break-words whitespace-normal w-full">
          <Icon name="check_circle" size={18} fill={1} className="flex-none" style={{ color: '#14b8a6' }} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
