'use client';

import { useEffect, useMemo, useState } from 'react';
import ChatButton from '../../components/ChatButton';
import HelloShell from '../../components/HelloShell';
import HostUpdateNotice from '../../components/HostUpdateNotice';
import { api } from '../../lib/api';
import { formatOslo } from '../../lib/oslo';
import {
  acceptedCount,
  activityById,
  groupReceivedByActivity,
  guestLimit,
  requestStatusLabel,
} from '../../lib/requests';
import { useHelloGate } from '../../lib/useHelloGate';

function ActivitySummary({ activity, viewerId, showHostUpdate }) {
  if (!activity) return <p className="text-sm text-[#6B5348]">Plan details unavailable.</p>;
  return (
    <>
      <h3 className="text-lg font-semibold text-[#32251F]">{activity.title}</h3>
      <p className="mt-1 text-sm text-[#6B5348]">{activity.place}</p>
      <p className="mt-1 text-sm text-[#6B5348]">{formatOslo(activity.starts_at)}</p>
      {showHostUpdate ? <HostUpdateNotice activity={activity} viewerId={viewerId} /> : null}
    </>
  );
}

export default function RequestsPage() {
  const { ready, session, profile, error: gateError } = useHelloGate('app');
  const [tab, setTab] = useState('received');
  const [activities, setActivities] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const hosted = useMemo(
    () => activities.filter(row => row.host_user_id === session?.user?.id),
    [activities, session],
  );
  const grouped = useMemo(
    () => groupReceivedByActivity(received, hosted),
    [received, hosted],
  );
  const sentWithActivity = useMemo(() => {
    const lookup = activityById(activities);
    return sent.map(row => ({ ...row, activity: lookup[row.activity_id] || null }));
  }, [sent, activities]);

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const [activityRows, receivedRows, sentRows] = await Promise.all([
        api('/activities'),
        api('/activity-requests/received'),
        api('/activity-requests'),
      ]);
      setActivities(activityRows);
      setReceived(receivedRows);
      setSent(sentRows);
      const ids = [...new Set(receivedRows.map(row => row.requester_user_id).filter(Boolean))];
      if (ids.length) {
        const rows = await api(`/profiles/host-names?${ids.map(id => `ids=${id}`).join('&')}`);
        setNames(Object.fromEntries(rows.map(row => [row.user_id, row.first_name])));
      } else {
        setNames({});
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session || !profile) return undefined;
    loadRequests();
    return undefined;
  }, [session, profile]);

  async function decide(requestId, status) {
    if (busyId) return;
    setBusyId(requestId);
    setError('');
    setMessage('');
    try {
      const updated = await api(`/activity-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setReceived(old => old.map(row => (row.id === updated.id ? updated : row)));
      setMessage(status === 'accepted' ? 'Request accepted.' : 'Request declined.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  const displayError = error || gateError;

  return (
    <HelloShell current="/requests">
      <main className="mx-auto min-h-screen max-w-lg px-5 py-6">
        <h1 className="text-4xl font-bold tracking-tight text-[#32251F]">Requests</h1>
        <p className="mt-3 text-[#6B5348]">Accept people into plans you host, or follow requests you sent.</p>
        <div className="mt-4 flex justify-end">
          <button type="button" className="hello-pass" onClick={loadRequests} disabled={loading || Boolean(busyId)}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Request lists">
          {['received', 'sent'].map(item => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className="hello-chip"
              onClick={() => { setTab(item); setError(''); }}
            >
              {item === 'received' ? 'Received' : 'Sent'}
            </button>
          ))}
        </div>
        {!ready || (session && !profile && !gateError) || (session && profile && loading) ? (
          <p className="mt-8 text-[#6B5348]">Loading…</p>
        ) : null}
        {ready && !session ? (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#32251F]">Sign in to see join requests.</p>
            <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/">Sign in</a>
          </section>
        ) : null}
        {session && profile && !loading && tab === 'received' ? (
          grouped.length ? (
            <ul className="mt-6 space-y-4">
              {grouped.map(group => {
                const limit = guestLimit(group.activity?.max_participants);
                const accepted = acceptedCount(group.requests);
                const full = limit > 0 && accepted >= limit;
                return (
                  <li key={group.activity?.id || group.requests[0]?.activity_id} className="rounded-2xl bg-white p-6 shadow-sm">
                    <ActivitySummary activity={group.activity} viewerId={session.user.id} />
                    <p className="mt-2 text-sm text-[#32251F]">
                      {accepted} of {limit} guests accepted
                    </p>
                    {full ? <p className="mt-2 font-semibold text-[#C2410C]">This activity is full</p> : null}
                    {group.requests.some(row => row.status === 'accepted') ? (
                      <ChatButton planId={group.activity?.id || group.requests[0]?.activity_id} />
                    ) : null}
                    <ul className="mt-4 space-y-3">
                      {group.requests.map(row => (
                        <li key={row.id} className="rounded-xl border border-[#E8D9C8] p-4">
                          <p className="font-semibold text-[#32251F]">{names[row.requester_user_id] || 'Member'}</p>
                          <p className="mt-1 text-sm text-[#6B5348]">{requestStatusLabel(row.status)}</p>
                          {row.status === 'pending' ? (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                className="hello-pass"
                                disabled={Boolean(busyId)}
                                onClick={() => decide(row.id, 'declined')}
                              >
                                {busyId === row.id ? 'Saving…' : 'Decline'}
                              </button>
                              <button
                                type="button"
                                className="hello-request"
                                disabled={Boolean(busyId) || full}
                                onClick={() => decide(row.id, 'accepted')}
                              >
                                {busyId === row.id ? 'Saving…' : 'Accept'}
                              </button>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          ) : (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#32251F]">No received requests</h2>
              <p className="mt-3 text-[#6B5348]">When someone asks to join a plan you host, it will show up here.</p>
            </section>
          )
        ) : null}
        {session && profile && !loading && tab === 'sent' ? (
          sentWithActivity.length ? (
            <ul className="mt-6 space-y-4">
              {sentWithActivity.map(row => (
                <li key={row.id} className="rounded-2xl bg-white p-6 shadow-sm">
                  <ActivitySummary
                    activity={row.activity}
                    viewerId={session.user.id}
                    showHostUpdate={row.status === 'accepted'}
                  />
                  <p className="mt-3 text-sm text-[#32251F]">{requestStatusLabel(row.status)}</p>
                  {row.status === 'accepted' ? (
                    <>
                      <p className="mt-2 font-semibold text-[#C2410C]">You’re going!</p>
                      <ChatButton planId={row.activity_id} />
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#32251F]">No sent requests</h2>
              <p className="mt-3 text-[#6B5348]">Request to join a plan on For You, then track it here.</p>
            </section>
          )
        ) : null}
        {displayError ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{displayError}</p> : null}
        {message ? <p role="status" className="mt-5 rounded-xl bg-white p-4 text-[#32251F]">{message}</p> : null}
      </main>
    </HelloShell>
  );
}
