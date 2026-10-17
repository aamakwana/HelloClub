export const PLAN_EDIT_LOCK_HOURS = 12;

export const PLAN_EDIT_LOCKED_MESSAGE =
  'Changes are locked 12 hours before the plan, because people have already said yes.';

export function planEditsLocked(startsAt, now = Date.now()) {
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) return true;
  return start <= now + PLAN_EDIT_LOCK_HOURS * 60 * 60 * 1000;
}
