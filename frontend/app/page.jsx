'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import HelloHeader from '../components/HelloHeader';
import HelloNav from '../components/HelloNav';
import TaskWorkspace from '../components/TaskWorkspace';
import { api } from '../lib/api';
import { getMyProfile } from '../lib/profileFields';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
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
    if (signup && !data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
      return;
    }
    const profile = await getMyProfile(api);
    router.replace(profile ? '/for-you' : '/onboarding');
  }
  if (!ready) {
    return (
      <div className="hello-app min-h-screen bg-[#FFF8EF] px-6 py-16 text-[#32251F]">
        <p className="hello-club-mark">Hello Club</p>
        <p className="mt-8">Loading…</p>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="hello-app min-h-screen bg-[#FFF8EF] text-[#32251F]">
        <main className="mx-auto max-w-lg px-5 py-10">
          <p className="hello-club-mark">Hello Club</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Good plans. New friends.</h1>
          <p className="mt-3 text-[#6B5348]">Sign in with email and password. Confirm your email if you are creating an account.</p>
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <AuthForm
              email={email}
              password={password}
              busy={busy}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSignIn={() => run(() => authenticate(false))}
              onSignUp={() => run(() => authenticate(true))}
            />
          </section>
          {message ? <p role="status" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{message}</p> : null}
        </main>
      </div>
    );
  }
  return (
    <div className="hello-app min-h-screen bg-[#FFF8EF] text-[#32251F]">
      <HelloHeader />
      <main className="hello-app-main mx-auto max-w-3xl px-6 py-16">
        <p className="hello-club-mark">Hello Club</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-4 text-[#6B5348]">The original starter workspace is still here.</p>
        <section className="mt-10 rounded-2xl bg-white p-8 shadow-sm">
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
          {message && <p role="status" className="mt-5 rounded-lg bg-slate-100 p-4">{message}</p>}
        </section>
      </main>
      <HelloNav />
    </div>
  );
}
