<script lang="ts">
	import type { SkillLevel } from '$lib/types/bridge';

	export let initialPlayerName: string;
	export let initialRobotSkillLevels: SkillLevel[];
	export let initialShowHints: boolean;
	export let initialTutorialMode: boolean;
	export let onSettingsChange: (settings: any) => void;

	let playerName: string = initialPlayerName;
	let robotSkillLevels: SkillLevel[] = [...initialRobotSkillLevels];
	let showHints: boolean = initialShowHints;
	let tutorialMode: boolean = initialTutorialMode;

	function updateSettings() {
		onSettingsChange({
			playerName,
			robotSkillLevels,
			showHints,
			tutorialMode
		});
	}
</script>

<div class="bg-gray-100 p-4 rounded-lg">
	<h3 class="text-lg font-bold mb-4">Settings</h3>
	
	<div class="mb-4">
		<label class="block font-medium mb-2">Player Name:</label>
		<input 
			type="text" 
			bind:value={playerName} 
			on:input={updateSettings}
			class="border rounded px-2 py-1 w-full"
		/>
	</div>
	
	<div class="mb-4">
		<label class="block font-medium mb-2">Robot Skill Levels:</label>
		{#each robotSkillLevels as _, index}
			<div class="mb-2">
				<span class="mr-2">Robot {index + 1}:</span>
				<select 
					bind:value={robotSkillLevels[index]} 
					on:change={updateSettings}
					class="border rounded px-2 py-1"
				>
					<option value="beginner">Beginner</option>
					<option value="intermediate">Intermediate</option>
					<option value="advanced">Advanced</option>
					<option value="expert">Expert</option>
				</select>
			</div>
		{/each}
	</div>
	
	<div class="mb-4">
		<label class="flex items-center">
			<input 
				type="checkbox" 
				bind:checked={showHints} 
				on:change={updateSettings}
				class="mr-2"
			/>
			Show Hints
		</label>
	</div>
	
	<div class="mb-4">
		<label class="flex items-center">
			<input 
				type="checkbox" 
				bind:checked={tutorialMode} 
				on:change={updateSettings}
				class="mr-2"
			/>
			Tutorial Mode
		</label>
	</div>
</div>
