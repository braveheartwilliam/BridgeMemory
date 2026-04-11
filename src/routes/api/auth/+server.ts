import { auth } from '$lib/auth';
import { redirect, error } from '@sveltejs/kit';

export async function handle({ event }) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (!session) {
    throw redirect(302, '/login');
  }

  return new Response(JSON.stringify(session), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST({ event }) {
  try {
    const result = await auth.api.signIn({
      body: await event.request.json(),
      headers: event.request.headers,
    });

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}