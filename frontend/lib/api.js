import { supabase } from './supabase';

function formatDetail(detail, status) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(item => item.msg || 'Invalid input').join(' ');
  }
  return `Request failed (${status})`;
}

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
    const error = new Error(formatDetail(result.detail, response.status));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
