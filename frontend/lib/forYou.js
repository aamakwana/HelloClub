export const FOR_YOU_CATEGORIES = ['All', 'Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other'];

export function requestedActivityIds(requests) {
  return new Set((requests || []).map(row => row.activity_id));
}

export function visibleForYou(activities, { userId, requestedIds, category, now = new Date() }) {
  return (activities || [])
    .filter(activity => activity.host_user_id !== userId)
    .filter(activity => new Date(activity.starts_at) > now)
    .filter(activity => !requestedIds.has(activity.id))
    .filter(activity => category === 'All' || activity.category === category)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
}

export function upToGuestsLabel(maxParticipants) {
  const guests = Number(maxParticipants) - 1;
  if (!Number.isInteger(guests) || guests < 1) return 'Guest limit unavailable';
  if (guests === 1) return 'Up to 1 guest';
  return `Up to ${guests} guests`;
}
