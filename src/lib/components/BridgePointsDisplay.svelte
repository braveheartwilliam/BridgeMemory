<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let validation = {
		isValid: false,
		declarerPoints: 0,
		dummyPoints: 0,
		totalPoints: 0,
		errors: [] as string[]
	};
	
	const dispatch = createEventDispatcher();
	
	function getValidationColor(isValid: boolean): string {
		return isValid ? 'text-green-600' : 'text-red-600';
	}
	
	function getValidationIcon(isValid: boolean): string {
		return isValid ? '✅' : '❌';
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
	<h3 class="text-lg font-bold mb-4 text-gray-800">Bridge Points Validation</h3>
	
	<!-- Validation Status -->
	<div class="mb-4">
		<span class={`font-semibold text-lg ${getValidationColor(validation.isValid)}`}>
			{getValidationIcon(validation.isValid)} Deal Validation
		</span>
	</div>
	
	<!-- Points Breakdown -->
	<div class="grid grid-cols-3 gap-4 mb-4">
		<div class="text-center p-3 bg-blue-50 rounded-lg">
			<div class="text-2xl font-bold text-blue-600">{validation.declarerPoints}</div>
			<div class="text-sm text-gray-600">Declarer Points</div>
		</div>
		
		<div class="text-center p-3 bg-green-50 rounded-lg">
			<div class="text-2xl font-bold text-green-600">{validation.dummyPoints}</div>
			<div class="text-sm text-gray-600">Dummy Points</div>
		</div>
		
		<div class="text-center p-3 bg-purple-50 rounded-lg">
			<div class="text-2xl font-bold text-purple-600">{validation.totalPoints}</div>
			<div class="text-sm text-gray-600">Total Points</div>
		</div>
	</div>
	
	<!-- Partnership Requirement -->
	<div class="mb-4 p-3 bg-gray-50 rounded-lg">
		<div class="text-sm font-semibold text-gray-700 mb-1">Partnership Requirement:</div>
		<div class="text-xs text-gray-600">
			Total points must be between 23 and 28 (inclusive)
		</div>
		<div class={`text-sm font-bold mt-1 ${validation.totalPoints >= 23 && validation.totalPoints <= 28 ? 'text-green-600' : 'text-red-600'}`}>
			{validation.totalPoints >= 23 && validation.totalPoints <= 28 ? '✅ Requirement Met' : '❌ Requirement Not Met'}
		</div>
	</div>
	
	<!-- Errors -->
	{#if validation.errors.length > 0}
		<div class="p-3 bg-red-50 rounded-lg border border-red-200">
			<div class="text-sm font-semibold text-red-700 mb-2">Validation Errors:</div>
			{#each validation.errors as error}
				<div class="text-xs text-red-600">• {error}</div>
			{/each}
		</div>
	{/if}
	
	<!-- Rules Reference -->
	<div class="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
		<div class="text-sm font-semibold text-yellow-700 mb-2">Bridge Rules Applied:</div>
		<div class="text-xs text-yellow-700 space-y-1">
			<div>• Face cards: A=4, K=3, Q=2, J=1 points</div>
			<div>• Declarer: Minimum 12 points + 5+ hearts required</div>
			<div>• Declarer bonus: +1 point for each heart beyond 5</div>
			<div>• Dummy: Points for suit shortages (void=5, singleton=3, doubleton=1)</div>
			<div>• Partnership: Total points between 12-28</div>
		</div>
	</div>
</div>
