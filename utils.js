export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function truncateText(text = '', maxLength = 160) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function debounce(fn, delay = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function formatYear(dateStr) {
  return dateStr ? dateStr.slice(0, 4) : '—';
}

export function formatFullDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRuntime(minutes) {
  if (!minutes && minutes !== 0) return null;
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatRating(voteAverage) {
  if (!voteAverage || voteAverage <= 0) return null;
  return voteAverage.toFixed(1);
}

export function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function buildSearchUrl(query) {
  return `index.html?q=${encodeURIComponent(query)}`;
}
