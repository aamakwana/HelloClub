export const GUEST_PRESETS = [
  { id: '1', label: '1', guests: 1 },
  { id: '2-4', label: '2–4', guests: 4 },
  { id: '5-7', label: '5–7', guests: 7 },
  { id: '8-10', label: '8–10', guests: 10 },
  { id: '10+', label: '10+', guests: null, minGuests: 10 },
  { id: 'custom', label: 'Custom', guests: null, minGuests: 1 },
];

export const AUDIENCE_OPTIONS = [
  { id: 'everyone', label: 'Everyone' },
  { id: 'women_only', label: 'Women only' },
  { id: 'men_only', label: 'Men only' },
];

export const MAX_GUESTS = 49;

export function guestLimitFromPreset(presetId, exactValue) {
  const preset = GUEST_PRESETS.find(item => item.id === presetId);
  if (!preset) return null;
  if (preset.guests != null) return preset.guests;
  const guests = Number(exactValue);
  if (!Number.isInteger(guests)) return null;
  if (guests < preset.minGuests || guests > MAX_GUESTS) return null;
  return guests;
}

export function guestsToMaxParticipants(guestLimit) {
  return guestLimit + 1;
}

export function guestHelperText(guestLimit) {
  if (guestLimit === 1) return 'Up to 1 guest + you.';
  return `Up to ${guestLimit} guests + you.`;
}

export function guestCapacityLabel(maxParticipants) {
  const guests = Number(maxParticipants) - 1;
  if (!Number.isInteger(guests) || guests < 1) return 'Guest limit unavailable';
  return guestHelperText(guests).replace(/\.$/, '');
}

export function audiencePreferenceLabel(value) {
  return AUDIENCE_OPTIONS.find(item => item.id === value)?.label || 'Everyone';
}
