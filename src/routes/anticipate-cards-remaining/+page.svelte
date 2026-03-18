<script lang="ts" context="module">
	import '../../app.css';
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let gameMode: string = 'counting';
	let selectedPlayers: string = 'all';

	onMount(() => {
		console.log('Anticipate Cards Remaining page loaded');
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
		console.log('Starting Anticipate Cards Remaining game');
		console.log(`Mode: ${gameMode}, Players: ${selectedPlayers}`);
		// TODO: Navigate to actual game interface
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">
			<div class="text-center">
				<h1 class="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
					Anticipate Cards Remaining
				</h1>
				<p class="text-gray-600 text-lg">
					Master the skill of calculating which cards are still in play. Predict opponents' holdings and make strategic decisions with confidence.
				</p>
			</div>
		</header>

		<!-- Game Configuration -->
		<main class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
			<h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Game Configuration</h2>
			
			<div class="grid md:grid-cols-2 gap-8 mb-8">
				<!-- Game Mode Selection -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-teal-100">
					<h3 class="text-lg font-semibold text-gray-800 mb-4">Game Mode</h3>
					<div class="space-y-3">
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="counting" 
								bind:group={gameMode}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500"
							/>
							<span class="text-gray-700">1) Card Counting Challenge</span>
						</label>
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="prediction" 
								bind:group={gameMode}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500"
							/>
							<span class="text-gray-700">2) Prediction Challenge</span>
						</label>
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								value="probability" 
								bind:group={gameMode}
								class="w-4 h-4 text-teal-600 focus:ring-teal-500"
							/>
							<span class="text-gray-700">3) Probability Analysis</span>
						</label>
					</div>
				</div>

				<!-- Player Selection -->
				<div class="bg-white rounded-xl p-6 shadow-lg border border-cyan-100">
					<h3 class="text-lg font-semibold text-gray-800 mb-4">Player Selection</h3>
					<div class="space-y-3">
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="players" 
								value="all" 
								bind:group={selectedPlayers}
								class="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
							/>
							<span class="text-gray-700">All Players</span>
						</label>
						<label class="flex items-center space-x-3 cursor-pointer">
							<input 
								type="radio" 
								name="players" 
								value="specific" 
								bind:group={selectedPlayers}
								class="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
							/>
							<span class="text-gray-700">Specific Player</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Start Game Button -->
			<div class="text-center mt-8">
				<button 
					class="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
					on:click={startGame}
				>
					Start Card Analysis
				</button>
			</div>
		</main>

		<!-- Back Navigation -->
		<nav class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4 mt-8">
			<div class="text-center">
				<a 
					href="/" 
					class="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300"
				>
					← Back to Home
				</a>
			</div>
		</nav>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	.animate-fade-in {
		animation: fadeIn 0.6s ease-out;
	}
</style>
