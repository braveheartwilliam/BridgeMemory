import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { userSchema, gameSessionSchema } from '$lib/validation';

export const load = (async () => {
  // Initialize forms with SuperForms
  const loginForm = await superValidate(zod4(userSchema));
  const gameSessionForm = await superValidate(zod4(gameSessionSchema));

  return {
    loginForm,
    gameSessionForm
  };
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(userSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: form.data.email,
          password: form.data.password
        },
        headers: { cookie: cookies.toString() }
      });

      if (result.user) {
        throw redirect(302, '/dashboard');
      }

      return fail(400, { form, message: 'Invalid credentials' });
    } catch (error) {
      return fail(500, { form, message: 'Authentication failed' });
    }
  },

  register: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(userSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: form.data.email,
          password: form.data.password,
          name: form.data.name
        },
        headers: { cookie: cookies.toString() }
      });

      if (result.user) {
        // Auto-login after successful registration
        const loginResult = await auth.api.signInEmail({
          body: {
            email: form.data.email,
            password: form.data.password
          },
          headers: { cookie: cookies.toString() }
        });

        if (loginResult.user) {
          throw redirect(302, '/dashboard');
        }
      }

      return fail(400, { form, message: 'Registration failed' });
    } catch (error) {
      return fail(500, { form, message: 'Registration failed' });
    }
  },

  createGameSession: async ({ request, cookies }) => {
    const form = await superValidate(request, zod4(gameSessionSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const session = await auth.api.getSession({
      headers: { cookie: cookies.toString() }
    });

    if (!session?.user) {
      return fail(401, { form, message: 'Authentication required' });
    }

    try {
      // Create game session logic would go here
      // For now, return success
      return { form, success: true, message: 'Game session created' };
    } catch (error) {
      return fail(500, { form, message: 'Failed to create game session' });
    }
  }
} satisfies Actions;