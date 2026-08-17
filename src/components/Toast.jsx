import { useApp } from '../context.jsx';
import { Icon } from './Icon.jsx';

export function Toast() {
  const { state, dispatch } = useApp();
  const toast = state.toast;
  const visible = !!toast;
  
  // Default to bottom if not specified
  const position = toast?.position || 'bottom';

  const positionClasses = position === 'top' 
    ? 'top-20 md:top-10' 
    : 'bottom-16 md:bottom-8';

  const hiddenTransform = position === 'top'
    ? 'translateX(-50%) translateY(-30px) scale(0.95)'
    : 'translateX(-50%) translateY(20px) scale(0.95)';

  const handleClose = (e) => {
    e.stopPropagation();
    dispatch({ type: 'CLEAR_TOAST' });
  };

  return (
    <div
      className={`fixed ${positionClasses} left-1/2 z-[100] pointer-events-none flex justify-center px-4 w-auto max-w-full`}
      style={{
        transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(-50%) translateY(0) scale(1)' : hiddenTransform,
      }}
    >
      {visible && (
        <div 
          className={`pointer-events-auto w-auto max-w-[90vw] md:max-w-md relative overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.18)] border transition-all ${
            toast.type === 'notification' 
              ? 'bg-white/95 backdrop-blur-2xl border-white/60 p-4 rounded-[24px] text-slate-800 w-full' 
              : 'bg-slate-900/95 backdrop-blur-xl border-slate-800/80 px-5 py-3 rounded-full text-white flex items-center justify-center text-center gap-2.5'
          }`}
        >
          {toast.type === 'notification' ? (
            <div className="flex flex-col w-full relative">
              {/* Close Button absolutely positioned */}
              <button 
                onClick={handleClose}
                className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center bg-slate-100/80 hover:bg-slate-200 border-none cursor-pointer transition-colors z-10"
              >
                <Icon name="close" size={12} className="text-slate-500" />
              </button>

              {/* Body: Title, Message preview */}
              <div className="flex items-start gap-3.5 pr-6 pt-1">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-none bg-[#fffbeb] border border-amber-100/50 shadow-inner">
                  <Icon name="notifications_active" size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-slate-850 truncate">
                    {toast.title || 'New Notification'}
                  </h4>
                  <p className="text-[12.5px] font-semibold text-slate-500 leading-snug mt-0.5 line-clamp-2">
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Icon name="check_circle" size={18} fill={1} className="flex-none" style={{ color: '#14b8a6' }} />
              <span className="text-sm font-bold tracking-wide">{toast.message}</span>
            </>
          )}

          {/* Accent border left for notifications */}
          {toast.type === 'notification' && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#14b8a6] to-[#7c6cf0]" />
          )}
        </div>
      )}
    </div>
  );
}
