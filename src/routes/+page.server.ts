import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

// Simple validation schemas
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const gameSessionSchema = z.object({
  name: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  maxPlayers: z.number().min(1).max(4)
});

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
  login: async ({ request }) => {
    const form = await superValidate(request, zod4(userSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Simple login logic for now
    console.log('Login attempt:', form.data);
    
    return { form, success: true, message: 'Login successful (demo)' };
  },

  register: async ({ request }) => {
    const form = await superValidate(request, zod4(userSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Simple registration logic for now
    console.log('Registration attempt:', form.data);
    
    return { form, success: true, message: 'Registration successful (demo)' };
  },

  createGameSession: async ({ request }) => {
    const form = await superValidate(request, zod4(gameSessionSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    // Simple game session creation logic for now
    console.log('Game session creation:', form.data);
    
    return { form, success: true, message: 'Game session created (demo)' };
  }
} satisfies Actions;
