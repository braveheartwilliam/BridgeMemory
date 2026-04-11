import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  const session = await auth.api.getSession({
    headers: { cookie: cookies.toString() },
  });

  if (session) {
    throw redirect(302, '/dashboard');
  }

  return {
    session: null,
  };
}

export const actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return {
        error: 'Email and password are required',
      };
    }

    try {
      const result = await auth.api.signInEmail({
        body: { email, password },
        headers: { cookie: cookies.toString() },
      });

      if (result.user) {
        throw redirect(302, '/dashboard');
      }

      return {
        error: 'Invalid credentials',
      };
    } catch (error) {
      return {
        error: 'Authentication failed',
      };
    }
  },
};