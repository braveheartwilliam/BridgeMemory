import { auth } from '$lib/auth';
import { redirect, error } from '@sveltejs/kit';

export async function GET({ event }) {
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

export async function POST({ request }) {
  try {
    const result = await auth.api.signInEmail({
      body: await request.json(),
      headers: request.headers,
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