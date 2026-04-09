import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies }) {
  const session = await auth.api.getSession({
    headers: cookies,
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

    if (!email || !password) {
      return {
        error: 'Email and password are required',
      };
    }

    try {
      const result = await auth.api.signIn({
        body: { email, password },
        headers: cookies,
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