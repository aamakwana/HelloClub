import ChatButton from './ChatButton';
import { audiencePreferenceLabel, guestCapacityLabel } from '../lib/planCapacity';
import { formatOslo } from '../lib/oslo';

export default function HostedPlanList({ plans, loading }) {
  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#32251F]">My hosted plans</h2>
      {loading ? <p className="mt-3 text-[#6B5348]">Loading your plans…</p> : null}
      {!loading && !plans.length ? <p className="mt-3 text-[#6B5348]">No hosted plans yet.</p> : null}
      <ul className="mt-4 space-y-3">
        {plans.map(plan => (
          <li key={plan.id} className="rounded-xl border border-[#E8D9C8] p-4">
            <p className="font-semibold text-[#32251F]">{plan.title}</p>
            <p className="mt-1 text-sm text-[#6B5348]">{plan.category} · {plan.place}</p>
            <p className="mt-1 text-sm text-[#6B5348]">{formatOslo(plan.starts_at)}</p>
            <p className="mt-1 text-sm text-[#6B5348]">
              {guestCapacityLabel(plan.max_participants)} · {audiencePreferenceLabel(plan.audience_preference)}
            </p>
            <ChatButton planId={plan.id} />
          </li>
        ))}
      </ul>
    </section>
  );
}
