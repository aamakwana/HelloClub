'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CreatePlanForm from '../../components/CreatePlanForm';
import HelloShell from '../../components/HelloShell';
import HostedPlanList from '../../components/HostedPlanList';
import { api } from '../../lib/api';
import { useHelloGate } from '../../lib/useHelloGate';
import { formatOslo, osloDateTimeLocal } from '../../lib/oslo';
import {
  AUDIENCE_OPTIONS,
  guestCapacityLabel,
  guestLimitFromPreset,
  guestsToMaxParticipants,
  audiencePreferenceLabel,
} from '../../lib/planCapacity';
import { resolvePlaceName } from '../../lib/places';

const CATEGORIES = ['Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other'];
const emptyForm = {
  title: '',
  category: '',
  place: '',
  startsAt: '',
  guestPreset: '2-4',
  guestLimit: '4',
  audiencePreference: 'everyone',
  description: '',
};

function validate(values, minDateTime) {
  const title = values.title.trim();
  const place = values.place.trim();
  const description = values.description.trim();
  const guestLimit = guestLimitFromPreset(values.guestPreset, values.guestLimit);
  if (!title || title.length > 120) return 'Add a title up to 120 characters.';
  if (!CATEGORIES.includes(values.category)) return 'Choose a category.';
  if (!place || place.length > 200) return 'Add a public meeting place.';
  if (!values.startsAt) return 'Choose a date and time.';
  if (values.startsAt <= minDateTime) return 'Choose a future date and time in Trondheim (Europe/Oslo).';
  if (values.guestPreset === '10+' && guestLimit == null) {
    return 'For 10+, enter an exact guest limit from 10 to 49.';
  }
  if (values.guestPreset === 'custom' && guestLimit == null) {
    return 'For Custom, enter an exact guest limit from 1 to 49.';
  }
  if (guestLimit == null) return 'Choose how many people can join you.';
  if (!AUDIENCE_OPTIONS.some(option => option.id === values.audiencePreference)) {
    return 'Choose who can join.';
  }
  if (description.length > 500) return 'Description must be 500 characters or fewer.';
  return null;
}

function CreatePlanContent() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get('placeId');
  const minDateTime = useMemo(() => osloDateTimeLocal(new Date(Date.now() + 60_000)), []);
  const { ready, session, profile, error: gateError } = useHelloGate('app');
  const [values, setValues] = useState({ ...emptyForm, startsAt: minDateTime });
  const [busy, setBusy] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  const [hosted, setHosted] = useState([]);

  async function loadHosted(userId) {
    setLoadingPlans(true);
    try {
      const rows = await api('/activities');
      setHosted(rows.filter(row => row.host_user_id === userId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingPlans(false);
    }
  }

  useEffect(() => {
    if (!session || !profile) return;
    loadHosted(session.user.id);
  }, [session, profile]);

  useEffect(() => {
    let current = true;
    if (!placeId) return undefined;
    resolvePlaceName(placeId).then(name => {
      if (current && name) setValues(old => (old.place ? old : { ...old, place: name }));
    });
    return () => { current = false; };
  }, [placeId]);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    setMessage('');
    const problem = validate(values, minDateTime);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    try {
      const guestLimit = guestLimitFromPreset(values.guestPreset, values.guestLimit);
      const activity = await api('/activities', {
        method: 'POST',
        body: JSON.stringify({
          title: values.title.trim(),
          category: values.category,
          place: values.place.trim(),
          starts_at: values.startsAt,
          max_participants: guestsToMaxParticipants(guestLimit),
          audience_preference: values.audiencePreference,
          description: values.description.trim() || null,
        }),
      });
      setSaved(activity);
      setMessage('Plan saved.');
      setValues({ ...emptyForm, startsAt: minDateTime });
      await loadHosted(session.user.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 py-10">
      <p className="hello-club-mark">Hello Club</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#32251F]">Create a plan</h1>
      <p className="mt-3 text-[#6B5348]">Post something you want to do in Trondheim. Someone new can join you.</p>
      {!ready || (session && !profile && !gateError) ? <p className="mt-8 text-[#6B5348]">Loading…</p> : !session ? (
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-[#32251F]">Sign in to create a plan.</p>
          <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/">Sign in</a>
        </section>
      ) : profile ? (
        <>
          <div className="mt-8">
            <CreatePlanForm values={values} minDateTime={minDateTime} busy={busy} onChange={setValues} onSubmit={onSubmit} />
          </div>
          {error ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{error}</p> : null}
          {message ? <p role="status" className="mt-5 rounded-xl bg-white p-4 text-[#32251F]">{message}</p> : null}
          {saved ? (
            <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#32251F]">Saved plan</h2>
              <p className="mt-3 font-semibold text-[#32251F]">{saved.title}</p>
              <p className="mt-1 text-sm text-[#6B5348]">{saved.category} · {saved.place}</p>
              <p className="mt-1 text-sm text-[#6B5348]">{formatOslo(saved.starts_at)}</p>
              <p className="mt-1 text-sm text-[#6B5348]">
                {guestCapacityLabel(saved.max_participants)} · {audiencePreferenceLabel(saved.audience_preference)}
              </p>
              {saved.description ? <p className="mt-3 text-[#32251F]">{saved.description}</p> : null}
            </section>
          ) : null}
          <HostedPlanList plans={hosted} loading={loadingPlans} />
        </>
      ) : null}
      {gateError ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{gateError}</p> : null}
    </main>
  );
}

export default function CreatePlanPage() {
  return (
    <HelloShell current="/create">
      <div className="hello-create">
        <Suspense fallback={<p className="p-10 text-[#6B5348]">Loading…</p>}>
          <CreatePlanContent />
        </Suspense>
      </div>
    </HelloShell>
  );
}
