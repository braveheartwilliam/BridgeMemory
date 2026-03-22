<script lang="ts" module>
	import '../../../app.css';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let gameMode = $state<string>('full-hand');
	let selectedPlayers = $state<string>('all');
	let gameStarted = $state<boolean>(false);
	let incorrectCount: number = 0;
	let attemptCount: number = 0;
	let feedbackMessage: string = '';

	// Navigation functions
	function goToBridgeMemory() {
		goto('/bridge-memory');
	}

	function goToMain() {
		goto('/');
	}

	// Reactive statement to track gameMode changes
	$effect(() => {
		const gameModeValue = gameMode;
		console.log(`gameMode changed to: "${gameModeValue}" (type: ${typeof gameModeValue})`);
	});

	onMount(() => {
		console.log('Track Cards Played page loaded');
		console.log(`Initial gameMode: "${gameMode}"`);
	});

	function selectGameMode(mode: string) {
		gameMode = mode;
		console.log(`Selected game mode: ${mode}`);
	}

	function selectPlayers(players: string) {
		selectedPlayers = players;
		console.log(`Selected players: ${players}`);
	}

	function startGame() {
		console.log('Starting Track Cards Played game');
		console.log(`Mode: ${gameMode}, Players: ${selectedPlayers}`);
		console.log(`Game mode type: ${typeof gameMode}`);
		
		// Add small delay to ensure template updates properly
		setTimeout(() => {
			gameStarted = true;
			incorrectCount = 0;
			attemptCount = 0;
			feedbackMessage = '';
			
			if (gameMode === 'one-card') {
				console.log('Navigating to Game 2 (One Card mode)');
				goto('/bridge-memory/track-cards-played/game2?refresh=' + Date.now());
			} else if (gameMode === 'played-card' && selectedPlayers === 'specific') {
				console.log('Navigating to Game 3 (Four Hands - declarer and dummy face-up)');
				goto('/bridge-memory/track-cards-played/game3');
			} else {
				console.log('Navigating to Game 1');
				goto('/bridge-memory/track-cards-played/game1');
			}
		}, 100);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Breadcrumb Navigation -->
		<nav class="bg-white/80 backdrop-blur-sm border-b border-emerald-100 rounded-lg p-3 mb-6">
			<ol class="flex items-center space-x-2 text-sm">
				<li class="flex items-center">
					<button 
						onclick={goToMain}
						class="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
					>
						Bridge Intelligence Advancement
					</button>
					<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</li>
				<li class="flex items-center">
					<button 
						onclick={goToBridgeMemory}
						class="text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
					>
						Bridge Memory Challenge
					</button>
					<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</li>
				<li class="flex items-center">
					<span class="text-teal-600 font-semibold">Track Cards Played</span>
				</li>
			</ol>
		</nav>

		<!-- Navigation Buttons -->
		<div class="flex justify-between items-center mb-6">
			<div class="flex space-x-3">
				<button 
					onclick={goToMain}
					class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					<span>Main</span>
				</button>
				<button 
					onclick={goToBridgeMemory}
					class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>Memory App</span>
				</button>
			</div>
		</div>

		<!-- Header -->
		<header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">
			<div class="text-center">
				<h1 class="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
					Track Cards Played
				</h1>
				<p class="text-gray-600 text-lg">
					Master the art of remembering every card that hits the table. Sharpen your observational skills and gain the competitive edge.
				</p>
			</div>
		</header>

		<!-- Game Configuration -->
		<main class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
			<h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Game Configuration</h2>
			
			<div class="grid md:grid-cols-2 gap-8 mb-8">
				<!-- Game Mode Selection -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
					<h3 class="text-lg font-semibold text-gray-800 mb-4">Game Mode</h3>
					<div class="space-y-3">
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="full-hand" 
								bind:group={gameMode}
								class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-gray-700">1) Simultaneous Full hand memory Challenge</span>
						</label>
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="one-card" 
								bind:group={gameMode}
								class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-gray-700">2) One card - Full Hand Memory Challenge</span>
						</label>
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="played-card" 
								bind:group={gameMode}
								class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-gray-700">3) Played card memory Challenge</span>
						</label>
					</div>
				</div>

				<!-- Number of Hands -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-teal-100 {gameMode === 'full-hand' || gameMode === 'one-card' ? 'opacity-50' : ''}">
					<h3 class="text-lg font-semibold text-gray-800 mb-4 {gameMode === 'full-hand' || gameMode === 'one-card' ? 'text-gray-500' : ''}">Number of Hands</h3>
					<div class="space-y-3">
						<label class="flex items-center space-x-3 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'cursor-not-allowed' : 'cursor-pointer'}">
							<input 
								type="radio" 
								name="players" 
								value="all" 
								bind:group={selectedPlayers}
								disabled={gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card'}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'opacity-50 cursor-not-allowed' : ''}"
							/>
							<span class="text-gray-700 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'text-gray-500' : ''}">One Hand</span>
						</label>
						<label class="flex items-center space-x-3 {gameMode === 'full-hand' || gameMode === 'one-card' ? 'cursor-not-allowed' : 'cursor-pointer'}">
							<input 
								type="radio" 
								name="players" 
								value="specific" 
								bind:group={selectedPlayers}
								disabled={gameMode === 'full-hand' || gameMode === 'one-card'}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500 {gameMode === 'full-hand' || gameMode === 'one-card' ? 'opacity-50 cursor-not-allowed' : ''}"
							/>
							<span class="text-gray-700 {gameMode === 'full-hand' || gameMode === 'one-card' ? 'text-gray-500' : ''}">Four Hands (declarer and dummy face-up)</span>
						</label>
						<label class="flex items-center space-x-3 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'cursor-not-allowed' : 'cursor-pointer'}">
							<input 
								type="radio" 
								name="players" 
								value="full-hand" 
								bind:group={selectedPlayers}
								disabled={gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card'}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'opacity-50 cursor-not-allowed' : ''}"
							/>
							<span class="text-gray-700 {gameMode === 'full-hand' || gameMode === 'one-card' || gameMode === 'played-card' ? 'text-gray-500' : ''}">Four Hands (one defender face up)</span>
						</label>
					</div>
					{#if gameMode === 'full-hand' || gameMode === 'one-card'}
						<p class="text-sm text-gray-500 mt-3 italic">Number of Hands selection is not available for Game Mode 1 and Game Mode 2. These modes show all cards simultaneously.</p>
					{:else if gameMode === 'played-card'}
						<p class="text-sm text-gray-500 mt-3 italic">Only "Four Hands (declarer and dummy face-up)" is currently implemented for Game Mode 3. Other options will be available soon.</p>
					{/if}
				</div>
			</div>

			<!-- Start Game Button -->
			<div class="text-center mt-8">
				<button 
					class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
					onclick={startGame}
				>
					Start Memory Challenge
				</button>
			</div>
		</main>

		<!-- Game Mode Selection (shown after Start Memory Challenge is clicked) -->
		{#if gameStarted}
			<main class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
				<h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Game Mode Selection</h2>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
					<button 
						onclick={() => {
							gameMode = 'manual';
							console.log('Manual Mode selected, navigating to Game 2 playing page');
							goto('/track-cards-played/game2');
						}}
						class="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
					>
						<div class="text-center">
							<div class="text-4xl mb-4">🎮</div>
							<h4 class="text-2xl font-bold mb-3">Manual Mode</h4>
							<p class="text-sm opacity-90">Click cards yourself to flip them one at a time</p>
						</div>
					</button>
					
					<button 
						onclick={() => {
							gameMode = 'automated';
							console.log('Automated Mode selected, navigating to Game 2 playing page');
							goto('/track-cards-played/game2');
						}}
						class="p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
					>
						<div class="text-center">
							<div class="text-4xl mb-4">🤖</div>
							<h4 class="text-2xl font-bold mb-3">Automated Mode</h4>
							<p class="text-sm opacity-90">Cards flip automatically at regular intervals</p>
						</div>
					</button>
				</div>
				
				<div class="text-center text-sm text-gray-600 mt-8">
					<p class="mb-2">🎯 <strong>Manual Mode:</strong> Control the pace and practice card recognition</p>
					<p>🚀 <strong>Automated Mode:</strong> Test your memory with automatic card flipping</p>
				</div>
			</main>
		{/if}
	</div>
</div>

<style>
	/* Styles are handled by Tailwind CSS classes */
</style>
