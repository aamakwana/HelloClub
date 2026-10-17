import { useMemo, useState } from 'react';
import ChatButton from './ChatButton';
import { api } from '../lib/api';
import { formatOslo, osloDateTimeLocal } from '../lib/oslo';
import { PLAN_EDIT_LOCKED_MESSAGE, planEditsLocked } from '../lib/planEdits';
import { MAX_GUESTS, audiencePreferenceLabel, guestCapacityLabel } from '../lib/planCapacity';

function guestLimitFromPlan(plan) {
  const guests = Number(plan.max_participants) - 1;
  return Number.isInteger(guests) && guests > 0 ? guests : 1;
}

function EditPlanForm({ plan, accepted, minDateTime, busy, error, onChange, onCancel, onSave }) {
  const minGuests = Math.max(1, accepted);
  return (
    <form className="mt-4 space-y-3" onSubmit={onSave}>
      <label className="block text-sm font-semibold text-[#32251F]">
        Title
        <input
          required
          maxLength={120}
          value={plan.title}
          onChange={e => onChange('title', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="block text-sm font-semibold text-[#32251F]">
        Public meeting place
        <input
          required
          maxLength={200}
          value={plan.place}
          onChange={e => onChange('place', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="block text-sm font-semibold text-[#32251F]">
        Date and time
        <span className="mt-1 block font-normal text-sm text-[#6B5348]">Trondheim time (Europe/Oslo)</span>
        <input
          required
          type="datetime-local"
          min={minDateTime}
          value={plan.startsAt}
          onChange={e => onChange('startsAt', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <label className="block text-sm font-semibold text-[#32251F]">
        Spaces (guests)
        <input
          required
          type="number"
          min={minGuests}
          max={MAX_GUESTS}
          step={1}
          value={plan.guestLimit}
          onChange={e => onChange('guestLimit', e.target.value)}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      <p className="text-sm font-normal text-[#6B5348]">
        {accepted
          ? `You already accepted ${accepted} guest${accepted === 1 ? '' : 's'}. You cannot go below that.`
          : 'Guests do not include you.'}
      </p>
      {error ? <p role="alert" className="text-sm text-[#C2410C]">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" className="hello-pass" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export default function HostedPlanList({ plans, loading, acceptedByPlan = {}, onUpdated }) {
  const minDateTime = useMemo(() => osloDateTimeLocal(new Date(Date.now() + 60_000)), []);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEdit(plan) {
    setError('');
    setEditingId(plan.id);
    setDraft({
      title: plan.title,
      place: plan.place,
      startsAt: osloDateTimeLocal(new Date(plan.starts_at)),
      guestLimit: String(guestLimitFromPlan(plan)),
    });
  }

  function setDraftField(field, value) {
    setDraft(old => ({ ...old, [field]: value }));
  }

  async function saveEdit(event, plan) {
    event.preventDefault();
    if (busy || !draft) return;
    const title = draft.title.trim();
    const place = draft.place.trim();
    const guests = Number(draft.guestLimit);
    const accepted = acceptedByPlan[plan.id] || 0;
    if (!title || title.length > 120) {
      setError('Add a title up to 120 characters.');
      return;
    }
    if (!place || place.length > 200) {
      setError('Add a public meeting place.');
      return;
    }
    if (!draft.startsAt) {
      setError('Choose a date and time.');
      return;
    }
    if (draft.startsAt <= minDateTime) {
      setError('Choose a future date and time in Trondheim (Europe/Oslo).');
      return;
    }
    if (!Number.isInteger(guests) || guests < Math.max(1, accepted) || guests > MAX_GUESTS) {
      setError(accepted
        ? 'Cannot reduce spaces below the number already accepted'
        : 'Guest limit must be a whole number from 1 to 49.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await api(`/activities/${plan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          place,
          starts_at: draft.startsAt,
          max_participants: guests + 1,
        }),
      });
      onUpdated?.(updated);
      setEditingId('');
      setDraft(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#32251F]">My plans</h2>
      {loading ? <p className="mt-3 text-[#6B5348]">Loading your plans…</p> : null}
      {!loading && !plans.length ? <p className="mt-3 text-[#6B5348]">No hosted plans yet.</p> : null}
      <ul className="mt-4 space-y-3">
        {plans.map(plan => {
          const locked = planEditsLocked(plan.starts_at);
          const editing = editingId === plan.id && draft;
          return (
            <li key={plan.id} className="rounded-xl border border-[#E8D9C8] p-4">
              <p className="font-semibold text-[#32251F]">{plan.title}</p>
              <p className="mt-1 text-sm text-[#6B5348]">{plan.category} · {plan.place}</p>
              <p className="mt-1 text-sm text-[#6B5348]">{formatOslo(plan.starts_at)}</p>
              <p className="mt-1 text-sm text-[#6B5348]">
                {guestCapacityLabel(plan.max_participants)} · {audiencePreferenceLabel(plan.audience_preference)}
              </p>
              {locked ? (
                <p className="mt-3 text-sm text-[#6B5348]">{PLAN_EDIT_LOCKED_MESSAGE}</p>
              ) : editing ? (
                <EditPlanForm
                  plan={draft}
                  accepted={acceptedByPlan[plan.id] || 0}
                  minDateTime={minDateTime}
                  busy={busy}
                  error={error}
                  onChange={setDraftField}
                  onCancel={() => { setEditingId(''); setDraft(null); setError(''); }}
                  onSave={event => saveEdit(event, plan)}
                />
              ) : (
                <button type="button" className="hello-pass mt-3" onClick={() => startEdit(plan)}>
                  Edit
                </button>
              )}
              <ChatButton planId={plan.id} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
