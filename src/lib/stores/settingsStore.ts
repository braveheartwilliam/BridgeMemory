import { writable } from 'svelte/store';
import type { SkillLevel } from '$lib/types/bridge';

export interface Settings {
	playerName: string;
	robotSkillLevels: SkillLevel[];
	showHints: boolean;
	tutorialMode: boolean;
}

export const settingsStore = writable<Settings>({
	playerName: 'Player',
	robotSkillLevels: ['intermediate', 'intermediate', 'intermediate'],
	showHints: true,
	tutorialMode: false
});
