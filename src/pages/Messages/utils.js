export function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(d1, d2) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

export function formatDemarcationDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  // Strip time for accurate day difference
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = nowOnly - dateOnly;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }); // 'Monday'
  }
  
  return date.toLocaleDateString('en-US'); // '2/5/2026'
}
