export const MESSAGE_LIMIT = 10;
export const MESSAGE_MAX_LENGTH = 150;
export const QUICK_REPLIES = ["I'm here!", 'Running 5 min late', 'See you there!'];

export function messagesLeftLabel(count) {
  if (count === 1) return '1 message left';
  return `${count} messages left`;
}

export function canOpenPlanChat({ userId, activity, requests }) {
  if (!userId || !activity) return false;
  if (activity.host_user_id === userId) return true;
  return (requests || []).some(
    row => row.activity_id === activity.id
      && row.requester_user_id === userId
      && row.status === 'accepted',
  );
}
