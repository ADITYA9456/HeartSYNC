// Timezone helpers: canonical names (old aliases like Asia/Calcutta map to
// Asia/Kolkata) and the full IANA list where the browser supports it.
const ALIASES = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'Europe/Kiev': 'Europe/Kyiv',
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'Pacific/Truk': 'Pacific/Chuuk',
};

export const canonicalZone = (z) => (z && ALIASES[z]) || z;

export function detectZone() {
  try {
    return canonicalZone(Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function allZones(extra = []) {
  let list = [];
  try {
    list = Intl.supportedValuesOf('timeZone');
  } catch {
    list = [];
  }
  const set = new Set(['UTC', ...list.map(canonicalZone), ...extra.filter(Boolean).map(canonicalZone)]);
  return Array.from(set).sort();
}
