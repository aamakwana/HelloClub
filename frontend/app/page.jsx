'use client';
import { useEffect, useState } from 'react';
import AuthForm from '../components/AuthForm';
import TaskWorkspace from '../components/TaskWorkspace';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(error.message);
      setSession(data.session); setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_event, next) => { setSession(next); setTasks([]); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let current = true;
    if (session) api('/tasks').then(rows => { if (current) setTasks(rows); }).catch(e => { if (current) setMessage(e.message); });
    return () => { current = false; };
  }, [session]);
  async function run(action) {
    setBusy(true); setMessage('');
    try { await action(); } catch (e) { setMessage(e.message); } finally { setBusy(false); }
  }
  async function authenticate(signup) {
    const credentials = { email, password };
    const { data, error } = signup ? await supabase().auth.signUp(credentials) : await supabase().auth.signInWithPassword(credentials);
    if (error) throw error;
    setPassword('');
    if (signup && !data.session) setMessage('Check your email to confirm your account, then sign in.');
  }
  return <main className="mx-auto max-w-3xl px-6 py-16">
    <p className="text-sm font-bold uppercase tracking-widest text-blue-700">Launchpad / Starter</p>
    <h1 className="mt-4 text-5xl font-bold tracking-tight">One idea. Make it work.</h1>
    <p className="mt-4 text-lg text-slate-600">A small workspace for your next big weekend.</p>
    <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      {!ready ? <p>Loading your workspace…</p> : !session ? (
        <AuthForm
          email={email}
          password={password}
          busy={busy}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSignIn={() => run(() => authenticate(false))}
          onSignUp={() => run(() => authenticate(true))}
        />
      ) : (
        <TaskWorkspace
          email={session.user.email}
          title={title}
          tasks={tasks}
          busy={busy}
          onTitleChange={setTitle}
          onAdd={() => run(async () => {
            const task = await api('/tasks', { method: 'POST', body: JSON.stringify({ title: title.trim() }) });
            setTasks(old => [task, ...old]);
            setTitle('');
          })}
          onDelete={task => run(async () => {
            await api(`/tasks/${task.id}`, { method: 'DELETE' });
            setTasks(old => old.filter(t => t.id !== task.id));
          })}
          onSignOut={() => run(async () => {
            const { error } = await supabase().auth.signOut();
            if (error) throw error;
          })}
        />
      )}
      {message && <p role="status" className="mt-5 rounded-lg bg-slate-100 p-4">{message}</p>}
    </section>
  </main>;
}
