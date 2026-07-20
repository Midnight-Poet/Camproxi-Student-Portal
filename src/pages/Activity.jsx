import { useNavigate } from 'react-router-dom';
import { useApp } from '../context.jsx';
import { statusConfig, catIcon } from '../data.js';
import { Icon } from '../components/Icon.jsx';
import { useGetRequestsQuery } from '../store/apiSlice.js';

function getKind(type) {
  if (type === 'Lodges') return 'lodge';
  if (type === 'Services') return 'service';
  return 'product';
}

export function Activity() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  function handleContact(item) {
    dispatch({
      type: 'OPEN_CHAT_WITH',
      name: item.name,
      listing: item.name,
      kind: getKind(item.type),
    });
    navigate('/messages');
  }

  const { data: requestsRes, isLoading } = useGetRequestsQuery();
  const rawRequests = Array.isArray(requestsRes) ? requestsRes : (requestsRes?.data || []);

  // Format date helper
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-cx-ink mb-1">Activity</h1>
        <p className="text-sm text-cx-muted">Track your interests and requests</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-cx-border animate-pulse shadow-sm" />
          ))}
        </div>
      ) : rawRequests.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center py-28 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cx-bg flex items-center justify-center mb-4">
            <Icon name="receipt_long" size={28} fill={1} style={{ color: '#9aa0ab' }} />
          </div>
          <p className="font-bold text-cx-ink mb-1">No requests yet</p>
          <p className="text-sm text-cx-muted">Your property and product requests will appear here</p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-5 px-5 py-2.5 rounded-full text-sm font-bold border-none cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            style={{ background: '#e2f7f3', color: '#0d9488' }}
          >
            Explore listings
          </button>
        </div>
      ) : (
        /* Timeline */
        <div className="relative">
          {/* Track */}
          <div
            className="absolute left-[19px] top-6 bottom-6 w-px"
            style={{ background: '#ebedf0' }}
          />

          <div className="space-y-3">
            {rawRequests.map(req => {
              // The API returns the item nested inside req.item or similar.
              // We'll safely fallback if item is missing.
              const item = req.item || req.itemId || {};
              const itemName = req.itemName || item.title || 'Unknown Item';
              const itemCategory = req.itemCategory || item.category || 'PRODUCT';
              
              const actStatus = req.status || 'Pending';
              const { color, bg } = statusConfig(actStatus);
              
              // Map API category to UI kind for icons/contact routing
              const uiType = itemCategory === 'PROPERTY' ? 'Lodges' : itemCategory === 'SERVICE' ? 'Services' : 'Products';

              return (
                <div key={req.id || req._id} className="flex gap-4">

                  {/* Dot */}
                  <div className="flex-none pt-5" style={{ width: 40 }}>
                    <div
                      className="w-[10px] h-[10px] rounded-full border-2 border-white shadow-sm mx-auto"
                      style={{ background: color }}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-2xl border border-cx-border p-4 mb-1 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-none"
                          style={{ background: '#f4f5f7' }}
                        >
                          <Icon name={catIcon(uiType)} size={20} fill={1} style={{ color: '#5b6270' }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-cx-ink text-sm truncate">{itemName}</p>
                          <p className="text-xs text-cx-muted mt-0.5">{uiType} · {formatTime(req.createdAt)}</p>
                        </div>
                      </div>

                      <span
                        className="flex-none text-[11px] font-extrabold px-2.5 py-1 rounded-full capitalize"
                        style={{ color, background: bg }}
                      >
                        {actStatus.toLowerCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleContact({ name: itemName, type: uiType })}
                      className="w-full py-2 rounded-xl text-xs font-bold cursor-pointer border border-cx-border bg-white text-cx-ink3 hover:bg-cx-bg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Icon name="chat_bubble" size={13} style={{ color: '#5b6270' }} />
                      Contact
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
