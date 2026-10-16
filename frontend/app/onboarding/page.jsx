'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HelloShell from '../../components/HelloShell';
import ProfileForm from '../../components/ProfileForm';
import { api } from '../../lib/api';
import { emptyProfileForm, profilePayload, validateProfile } from '../../lib/profileFields';
import { useHelloGate } from '../../lib/useHelloGate';
import { supabase } from '../../lib/supabase';

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, session, profile, error, setError } = useHelloGate('onboarding');
  const [values, setValues] = useState(emptyProfileForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !session) router.replace('/');
  }, [ready, session, router]);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    const problem = validateProfile(values);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(profilePayload(values)),
      });
      router.replace('/for-you');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <HelloShell showNav={false}>
      <main className="mx-auto min-h-screen max-w-lg px-5 py-10">
        <p className="hello-club-mark">Hello Club</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#32251F]">Your profile</h1>
        <p className="mt-3 text-[#6B5348]">Tell people a little about you. Existing accounts can finish this without signing up again.</p>
        {!ready || (session && profile) ? <p className="mt-8 text-[#6B5348]">Loading…</p> : null}
        {ready && session && !profile ? (
          <div className="mt-8">
            <ProfileForm
              values={values}
              busy={busy}
              submitLabel="Save and continue"
              onChange={setValues}
              onSubmit={onSubmit}
            />
            <button
              type="button"
              className="hello-pass mt-4 w-full"
              onClick={() => supabase().auth.signOut()}
            >
              Sign out
            </button>
          </div>
        ) : null}
        {error ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{error}</p> : null}
      </main>
    </HelloShell>
  );
}
