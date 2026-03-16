import { writable } from 'svelte/store';
import type { GameState } from '$lib/types/bridge';

export const gameStore = writable<GameState | null>(null);
