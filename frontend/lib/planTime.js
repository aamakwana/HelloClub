import { useEffect, useState } from 'react';

export function planStartsInFuture(activity, now = new Date()) {
  if (!activity?.starts_at) return false;
  return new Date(activity.starts_at) > now;
}

export function upcomingPlans(list, now = new Date()) {
  return (list || []).filter(item => planStartsInFuture(item, now));
}

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
