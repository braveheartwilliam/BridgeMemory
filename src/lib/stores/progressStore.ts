import { writable } from 'svelte/store';

export interface Progress {
	gamesPlayed: number;
	memoryAccuracy: number;
	averageScore: number;
	achievements: string[];
	bestStreak: number;
}

export const progressStore = writable<Progress>({
	gamesPlayed: 0,
	memoryAccuracy: 0,
	averageScore: 0,
	achievements: [],
	bestStreak: 0
});
