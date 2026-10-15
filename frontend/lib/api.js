import { supabase } from './supabase';

export async function api(path, options = {}) {
  const { data, error } = await supabase().auth.getSession();
  if (error || !data.session) throw new Error('Please sign in again.');
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(typeof result.detail === 'string' ? result.detail : `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}
