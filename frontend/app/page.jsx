'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '../components/AuthForm';
import { api } from '../lib/api';
import { getMyProfile } from '../lib/profileFields';
import { supabase } from '../lib/supabase';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data, error }) => {
      if (error) setMessage(error.message);
      setSession(data.session);
      setReady(true);
    });
    const { data } = sb.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (ready && session) router.replace('/for-you');
  }, [ready, session, router]);

  async function run(action) {
    setBusy(true);
    setMessage('');
    try {
      await action();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function authenticate(signup) {
    const credentials = { email, password };
    const { data, error } = signup
      ? await supabase().auth.signUp(credentials)
      : await supabase().auth.signInWithPassword(credentials);
    if (error) throw error;
    setPassword('');
    if (signup && !data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
      return;
    }
    const profile = await getMyProfile(api);
    router.replace(profile ? '/for-you' : '/onboarding');
  }

  if (!ready || session) {
    return (
      <div className="hello-app min-h-screen bg-[#FFF8EF] px-6 py-16 text-[#32251F]">
        <p className="hello-club-mark">Hello Club</p>
        <p className="mt-8">Loading…</p>
      </div>
    );
  }

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
