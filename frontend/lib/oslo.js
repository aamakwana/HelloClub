export const OSLO_TIME_ZONE = 'Europe/Oslo';

export function osloDateTimeLocal(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('sv-SE', {
    timeZone: OSLO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return formatted.replace(' ', 'T').slice(0, 16);
}

export function osloTomorrowAt(hour = 18, minute = 0) {
  const today = osloDateTimeLocal().slice(0, 10);
  const [year, month, day] = today.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const ymd = next.toISOString().slice(0, 10);
  return `${ymd}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatOsloTime(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: OSLO_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function formatOslo(iso) {
  if (!iso) return '';
  const text = new Intl.DateTimeFormat('en-GB', {
    timeZone: OSLO_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
  return `${text} (Trondheim time)`;
}
