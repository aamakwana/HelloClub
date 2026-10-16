'use client';

import { useEffect, useState } from 'react';
import HelloShell from '../../components/HelloShell';
import ProfileForm from '../../components/ProfileForm';
import { api } from '../../lib/api';
import { genderLabel, profilePayload, profileToForm, validateProfile, yearOfStudyLabel } from '../../lib/profileFields';
import { useHelloGate } from '../../lib/useHelloGate';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { ready, session, profile, error, setProfile, setError } = useHelloGate('app');
  const [values, setValues] = useState(profileToForm(profile));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) setValues(profileToForm(profile));
  }, [profile]);

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
    setMessage('');
    try {
      const saved = await api('/profiles/me', {
        method: 'PUT',
        body: JSON.stringify(profilePayload(values)),
      });
      setProfile(saved);
      setValues(profileToForm(saved));
      setMessage('Profile saved.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <HelloShell current="/profile">
      <main className="mx-auto min-h-screen max-w-lg px-5 py-10">
        <p className="hello-club-mark">Hello Club</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#32251F]">Profile</h1>
        <p className="mt-3 text-[#6B5348]">Only you can see these details. Activity cards show your first name to people who are signed in.</p>
        {!ready ? <p className="mt-8 text-[#6B5348]">Loading…</p> : null}
        {ready && !session ? (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-[#32251F]">Sign in to view your profile.</p>
            <a className="mt-4 inline-block rounded-xl bg-[#C2410C] px-4 py-3 font-semibold text-white" href="/">Sign in</a>
          </section>
        ) : null}
        {ready && session && profile ? (
          <>
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xl font-semibold text-[#32251F]">{profile.first_name} {profile.last_name}</p>
              <p className="mt-2 text-sm text-[#6B5348]">{profile.study_programme} · {profile.school_name}</p>
              {yearOfStudyLabel(profile.year_of_study) ? (
                <p className="mt-1 text-sm text-[#6B5348]">{yearOfStudyLabel(profile.year_of_study)}</p>
              ) : null}
              <p className="mt-1 text-sm text-[#6B5348]">{profile.city} · {profile.age}</p>
              <p className="mt-1 text-sm text-[#6B5348]">{genderLabel(profile.gender)}</p>
            </section>
            <div className="mt-6">
              <ProfileForm
                values={values}
                busy={busy}
                submitLabel="Save profile"
                onChange={setValues}
                onSubmit={onSubmit}
              />
            </div>
            <button
              type="button"
              className="hello-pass mt-4 w-full"
              onClick={() => supabase().auth.signOut()}
            >
              Sign out
            </button>
          </>
        ) : null}
        {error ? <p role="alert" className="mt-5 rounded-xl bg-white p-4 text-[#C2410C]">{error}</p> : null}
        {message ? <p role="status" className="mt-5 rounded-xl bg-white p-4 text-[#32251F]">{message}</p> : null}
      </main>
    </HelloShell>
  );
}
