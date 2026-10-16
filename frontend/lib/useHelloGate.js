'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { getMyProfile } from './profileFields';
import { supabase } from './supabase';

export function useHelloGate(mode) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    const sb = supabase();

    async function load(nextSession) {
      if (!nextSession) {
        if (current) {
          setSession(null);
          setProfile(null);
          setReady(true);
        }
        return;
      }
      try {
        const row = await getMyProfile(api);
        if (!current) return;
        setSession(nextSession);
        setProfile(row);
        setError('');
        setReady(true);
      } catch (e) {
        if (!current) return;
        setSession(nextSession);
        setProfile(null);
        setError(e.message);
        setReady(true);
      }
    }

    sb.auth.getSession().then(({ data, error: authError }) => {
      if (authError && current) setError(authError.message);
      load(data.session);
    });
    const { data } = sb.auth.onAuthStateChange((_event, next) => load(next));
    return () => {
      current = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (mode === 'app' && session && !error && !profile) {
      router.replace('/onboarding');
    }
    if (mode === 'onboarding' && session && profile) {
      router.replace('/for-you');
    }
  }, [ready, session, profile, error, mode, router]);

  return { ready, session, profile, error, setProfile, setError };
}
