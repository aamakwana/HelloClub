'use client';

import { useEffect, useMemo, useState } from 'react';
import ForYouCard from '../../components/ForYouCard';
import HelloShell from '../../components/HelloShell';
import { api } from '../../lib/api';
import { FOR_YOU_CATEGORIES, requestedActivityIds, visibleForYou } from '../../lib/forYou';
import { useHelloGate } from '../../lib/useHelloGate';

export default function ForYouPage() {
  const { ready, session, profile, error: gateError } = useHelloGate('app');
  const [activities, setActivities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [hostNames, setHostNames] = useState({});
  const [passedIds, setPassedIds] = useState(() => new Set());
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const feed = useMemo(
    () => visibleForYou(activities, {
      userId: session?.user?.id,
      requestedIds: requestedActivityIds(requests),
      passedIds,
      category,
    }),
    [activities, requests, passedIds, category, session],
  );
  const current = feed[0] || null;
  const currentWithHost = current
    ? { ...current, hostFirstName: hostNames[current.host_user_id] || null }
    : null;

  async function loadFeed() {
    setLoading(true);
    setError('');
    try {
      const [rows, mine] = await Promise.all([api('/activities'), api('/activity-requests')]);
      setActivities(rows);
      setRequests(mine);
      const ids = [...new Set(rows.map(row => row.host_user_id).filter(Boolean))];
      if (ids.length) {
        const names = await api(`/profiles/host-names?${ids.map(id => `ids=${id}`).join('&')}`);
        setHostNames(Object.fromEntries(names.map(row => [row.user_id, row.first_name])));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session || !profile) return undefined;
    loadFeed();
    return undefined;
  }, [session, profile]);

  function passCurrent() {
    if (!current || busy) return;
    setError('');
    setMessage('');
    setPassedIds(old => new Set(old).add(current.id));
  }

  async function requestCurrent() {
    if (!current || busy) return;
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const saved = await api('/activity-requests', {
        method: 'POST',
        body: JSON.stringify({ activity_id: current.id }),
      });
      setRequests(old => [saved, ...old]);
      setMessage('Request sent—waiting for the host');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const displayError = error || gateError;

  return (
    <HelloShell current="/for-you">
      <main className="hello-for-you mx-auto min-h-screen max-w-lg px-5 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#32251F]">For You</h1>
        <p className="mt-3 text-[#6B5348]">Plans from students near you.</p>
        <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
          {FOR_YOU_CATEGORIES.map(item => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={category === item}
              className="hello-chip"
              onClick={() => { setCategory(item); setError(''); }}
            >
              {item}
            </button>
          ))}
        </div>
        {!ready || (session && !profile && !gateError) || (session && profile && loading) ? (
          <p className="mt-8 text-[#6B5348]">Loading…</p>
        ) : null}
        {ready && !session ? (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#32251F]">Sign in to see plans you can request to join.</p>
            <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/">Sign in</a>
          </section>
        ) : null}
        {session && profile && !loading && currentWithHost ? (
          <div className="mt-8">
            <ForYouCard activity={currentWithHost} busy={busy} onPass={passCurrent} onRequest={requestCurrent} />
          </div>
        ) : null}
        {session && profile && !loading && !current && !displayError ? (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#32251F]">No plans found</h2>
            <p className="mt-3 text-[#6B5348]">Try another category, or post something you want to do.</p>
            <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/create">Create a plan</a>
          </section>
        ) : null}
        {displayError ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{displayError}</p> : null}
        {message ? <p role="status" className="mt-5 rounded-xl bg-white p-4 text-[#32251F]">{message}</p> : null}
      </main>
    </HelloShell>
  );
}
