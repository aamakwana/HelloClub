export default function HostUpdateNotice({ activity, viewerId }) {
  if (!activity?.details_updated_at) return null;
  if (viewerId && activity.host_user_id === viewerId) return null;
  return <p className="mt-2 text-sm font-semibold text-[#C2410C]">Updated by host</p>;
}
