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
