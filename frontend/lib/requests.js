export const REQUEST_STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export function requestStatusLabel(status) {
  return REQUEST_STATUS_LABELS[status] || status;
}

export function guestLimit(maxParticipants) {
  const guests = Number(maxParticipants) - 1;
  return Number.isInteger(guests) && guests > 0 ? guests : 0;
}

export function acceptedCount(requests) {
  return (requests || []).filter(row => row.status === 'accepted').length;
}

export function groupReceivedByActivity(requests, activities) {
  const byActivity = new Map();
  for (const activity of activities || []) {
    byActivity.set(activity.id, { activity, requests: [] });
  }
  for (const row of requests || []) {
    const bucket = byActivity.get(row.activity_id);
    if (bucket) bucket.requests.push(row);
    else {
      byActivity.set(row.activity_id, { activity: null, requests: [row] });
    }
  }
  return [...byActivity.values()].filter(group => group.requests.length);
}

export function activityById(activities) {
  return Object.fromEntries((activities || []).map(row => [row.id, row]));
}
