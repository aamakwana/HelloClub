import { audiencePreferenceLabel } from '../lib/planCapacity';
import { formatOslo } from '../lib/oslo';
import { upToGuestsLabel } from '../lib/forYou';

export default function ForYouCard({ activity, busy, onPass, onRequest }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#C2410C]">{activity.category}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#32251F]">{activity.title}</h2>
      {activity.description ? <p className="mt-4 text-[#32251F]">{activity.description}</p> : null}
      <p className="mt-4 text-[#6B5348]">{formatOslo(activity.starts_at)}</p>
      <p className="mt-1 text-[#6B5348]">{activity.place}</p>
      {activity.hostFirstName ? (
        <p className="mt-4 text-sm text-[#32251F]">Host {activity.hostFirstName}</p>
      ) : null}
      <p className={`${activity.hostFirstName ? 'mt-2' : 'mt-4'} text-sm text-[#32251F]`}>{upToGuestsLabel(activity.max_participants)}</p>
      <p className="mt-2 text-sm text-[#32251F]">
        Who can request: {audiencePreferenceLabel(activity.audience_preference)}
      </p>
      <p className="mt-1 text-sm text-[#6B5348]">
        This is the host’s preference. Hello Club does not verify gender, so it is not used to block requests yet.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="hello-pass" onClick={onPass} disabled={busy}>
          Pass
        </button>
        <button type="button" className="hello-request" onClick={onRequest} disabled={busy}>
          {busy ? 'Sending…' : 'Request to join'}
        </button>
      </div>
    </article>
  );
}
