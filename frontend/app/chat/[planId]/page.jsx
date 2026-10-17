'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatComposer from '../../../components/ChatComposer';
import HelloShell from '../../../components/HelloShell';
import HostUpdateNotice from '../../../components/HostUpdateNotice';
import { api } from '../../../lib/api';
import { MESSAGE_MAX_LENGTH, messagesLeftLabel } from '../../../lib/chat';
import { formatOslo, formatOsloTime } from '../../../lib/oslo';
import { planStartsInFuture, useNow } from '../../../lib/planTime';
import { useHelloGate } from '../../../lib/useHelloGate';

export default function PlanChatPage() {
  const { planId } = useParams();
  const { ready, session, profile, error: gateError } = useHelloGate('app');
  const [activity, setActivity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [names, setNames] = useState({});
  const [messagesLeft, setMessagesLeft] = useState(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const newestRef = useRef(null);
  const now = useNow();
  const ended = Boolean(activity) && !planStartsInFuture(activity, now);

  async function loadChat() {
    setLoading(true);
    setError('');
    try {
      const payload = await api(`/activities/${planId}/messages`);
      setActivity(payload.activity);
      setMessages(payload.messages);
      setMessagesLeft(payload.messages_left);
      const ids = [...new Set((payload.messages || []).map(row => row.sender_id).filter(Boolean))];
      if (ids.length) {
        const rows = await api(`/profiles/host-names?${ids.map(id => `ids=${id}`).join('&')}`);
        setNames(Object.fromEntries(rows.map(row => [row.user_id, row.first_name])));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session || !profile || !planId) return undefined;
    loadChat();
    return undefined;
  }, [session, profile, planId]);

  useEffect(() => {
    if (loading) return;
    newestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  async function send(text) {
    const next = (text || '').trim();
    if (!next || busy || ended) return;
    if (next.length > MESSAGE_MAX_LENGTH) {
      setError('Keep messages to 150 characters');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const saved = await api(`/activities/${planId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: next }),
      });
      setMessages(old => [...old, saved]);
      setMessagesLeft(old => Math.max(0, (old ?? 1) - 1));
      setBody('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const displayError = error || gateError;
  const outOfMessages = messagesLeft === 0;

  return (
    <HelloShell current="/requests">
      <main className="hello-chat mx-auto min-h-screen max-w-lg px-5 py-10">
        <h1 className="text-4xl font-bold tracking-tight text-[#32251F]">Chat</h1>
        {activity ? (
          <>
            <p className="mt-3 font-semibold text-[#32251F]">{activity.title}</p>
            <p className="mt-1 text-[#6B5348]">{activity.place}</p>
            <p className="mt-1 text-sm text-[#6B5348]">{formatOslo(activity.starts_at)}</p>
            <HostUpdateNotice activity={activity} viewerId={session?.user?.id} />
            {ended ? <p className="mt-3 font-semibold text-[#C2410C]">This plan has ended</p> : null}
          </>
        ) : (
          <p className="mt-3 text-[#6B5348]">Arrange the meetup with people on this plan.</p>
        )}
        {!ready || (session && !profile && !gateError) || (session && profile && loading) ? (
          <p className="mt-8 text-[#6B5348]">Loading…</p>
        ) : null}
        {ready && !session ? (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#32251F]">Sign in to open this chat.</p>
            <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/">Sign in</a>
          </section>
        ) : null}
        {session && profile && !loading ? (
          <ul className="mt-6 space-y-3">
            {messages.map(row => {
              const mine = row.sender_id === session.user.id;
              return (
                <li key={row.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${mine ? 'text-right' : 'text-left'}`}>
                    <p className={`text-sm font-semibold ${mine ? 'text-[#C2410C]' : 'text-[#32251F]'}`}>
                      {mine ? 'You' : (names[row.sender_id] || 'Member')}
                      <span className="ml-2 font-normal text-[#6B5348]">{formatOsloTime(row.created_at)}</span>
                    </p>
                    <p className={`mt-1 inline-block rounded-[18px] px-4 py-2.5 text-left shadow-sm ${
                      mine
                        ? 'bg-[#C2410C] text-white'
                        : 'bg-white text-[#32251F]'
                    }`}
                    >
                      {row.body}
                    </p>
                  </div>
                </li>
              );
            })}
            <li ref={newestRef} aria-hidden="true" className="h-px" />
          </ul>
        ) : null}
        {session && profile && !loading && !ended && messagesLeft != null ? (
          <p role="status" className="mt-5 rounded-xl bg-white p-4 font-semibold text-[#32251F]">
            {messagesLeftLabel(messagesLeft)}
          </p>
        ) : null}
        {session && profile && !loading && !ended && outOfMessages && activity ? (
          <section className="mt-3 rounded-2xl bg-white p-6 shadow-sm">
            <p className="font-semibold text-[#32251F]">That&apos;s all your messages - see you there!</p>
            <p className="mt-2 text-[#6B5348]">{formatOslo(activity.starts_at)}</p>
            <p className="mt-1 text-[#6B5348]">{activity.place}</p>
          </section>
        ) : null}
        {session && profile && !loading && !ended && !outOfMessages ? (
          <ChatComposer
            body={body}
            busy={busy}
            onBodyChange={setBody}
            onSend={event => { event.preventDefault(); send(body); }}
            onQuickReply={text => send(text)}
          />
        ) : null}
        {displayError ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{displayError}</p> : null}
      </main>
    </HelloShell>
  );
}
