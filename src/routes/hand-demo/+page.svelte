<script lang="ts" context="module">
	import '../../app.css';

	// Card type definition
	export interface Card {
		suit: 'S' | 'H' | 'D' | 'C'; // Spades, Hearts, Diamonds, Clubs
		rank: string; // A, 2-10, J, Q, K
		id: string; // Unique identifier for each card
	}

	// Hand display options
	export interface HandDisplayOptions {
		displayMode: 'simple' | 'images' | 'grid' | 'fan';
		arrangement: 'horizontal' | 'vertical';
		flipEnabled: boolean;
		initialState: 'face' | 'back';
		autoFlipEnabled: boolean;
		autoFlipDuration: number; // in seconds
	}
</script>

<script lang="ts">
	import HandDisplay from '../../lib/components/HandDisplay.svelte';

	let showDemo = false;
	let currentDisplayMode: HandDisplayOptions['displayMode'] = 'simple';
	let currentArrangement: HandDisplayOptions['arrangement'] = 'horizontal';
	let flipEnabled = false;
	let initialState: HandDisplayOptions['initialState'] = 'face';
	let autoFlipEnabled = false;
	let autoFlipDuration = 7;

	// Component reference for calling functions
	let handDisplayRef: any;

	// Generate random hand
	function generateRandomHand(): Card[] {
		const suits: Card['suit'][] = ['S', 'H', 'D', 'C'];
		const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		const hand: Card[] = [];
		const usedCards = new Set<string>();

		while (hand.length < 13) {
			const suit = suits[Math.floor(Math.random() * suits.length)];
			const rank = ranks[Math.floor(Math.random() * ranks.length)];
			const cardKey = `${suit}${rank}`;

			if (!usedCards.has(cardKey)) {
				usedCards.add(cardKey);
				hand.push({
					suit,
					rank,
					id: cardKey // Use suit+rank as unique ID
				});
			}
		}

		return hand;
	}

	let cards: Card[] = generateRandomHand();

	// Display options for HandDisplay component
	$: displayOptions = {
		displayMode: currentDisplayMode,
		arrangement: currentArrangement,
		flipEnabled,
		initialState,
		autoFlipEnabled,
		autoFlipDuration
	};

	// Toggle functions
	function toggleDemo() {
		showDemo = !showDemo;
	}

	function setDisplayMode(mode: HandDisplayOptions['displayMode']) {
		currentDisplayMode = mode;
	}

	function setArrangement(arrangement: HandDisplayOptions['arrangement']) {
		currentArrangement = arrangement;
	}

	function toggleFlipEnabled() {
		flipEnabled = !flipEnabled;
	}

	function setInitialState(state: HandDisplayOptions['initialState']) {
		initialState = state;
		// Regenerate hand to reset states
		cards = generateRandomHand();
	}

	// Flip control functions
	function flipAllToFace() {
		if (handDisplayRef) {
			handDisplayRef.flipAllToFace();
		}
	}

	function flipAllToBack() {
		if (handDisplayRef) {
			handDisplayRef.flipAllToBack();
		}
	}

	function startAutoFlip() {
		if (handDisplayRef) {
			handDisplayRef.startAutoFlipSequence();
		}
	}

	function regenerateHand() {
		cards = generateRandomHand();
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">
			<h1 class="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
				Hand Display Component Demo
			</h1>
			<p class="text-center text-gray-600 mt-2">
				Generalized component for displaying bridge hands in multiple formats
			</p>
		</header>

		<!-- Controls -->
		<section class="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
			<h2 class="text-xl font-bold mb-4">Display Controls</h2>
			
			<div class="grid md:grid-cols-3 gap-6">
				<div>
					<h3 class="font-semibold mb-3">Display Mode</h3>
					<div class="space-y-2">
						<button 
							class="w-full px-4 py-2 {currentDisplayMode === 'simple' ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'} rounded-lg {currentDisplayMode === 'simple' ? 'hover:bg-emerald-700' : 'hover:bg-emerald-600'} transition-colors"
							on:click={() => setDisplayMode('simple')}
						>
							Simple Text
						</button>
						<button 
							class="w-full px-4 py-2 {currentDisplayMode === 'images' ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'} rounded-lg {currentDisplayMode === 'images' ? 'hover:bg-emerald-700' : 'hover:bg-emerald-600'} transition-colors"
							on:click={() => setDisplayMode('images')}
						>
							Card Images
						</button>
						<button 
							class="w-full px-4 py-2 {currentDisplayMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'} rounded-lg {currentDisplayMode === 'grid' ? 'hover:bg-emerald-700' : 'hover:bg-emerald-600'} transition-colors"
							on:click={() => setDisplayMode('grid')}
						>
							Grid Layout
						</button>
						<button 
							class="w-full px-4 py-2 {currentDisplayMode === 'fan' ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'} rounded-lg {currentDisplayMode === 'fan' ? 'hover:bg-emerald-700' : 'hover:bg-emerald-600'} transition-colors"
							on:click={() => setDisplayMode('fan')}
						>
							Fan Display
						</button>
					</div>
				</div>
				
				<div>
					<h3 class="font-semibold mb-3">Arrangement</h3>
					<div class="space-y-2">
						<button 
							class="w-full px-4 py-2 {currentArrangement === 'horizontal' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} rounded-lg {currentArrangement === 'horizontal' ? 'hover:bg-blue-700' : 'hover:bg-blue-600'} transition-colors"
							on:click={() => setArrangement('horizontal')}
						>
							Horizontal
						</button>
						<button 
							class="w-full px-4 py-2 {currentArrangement === 'vertical' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} rounded-lg {currentArrangement === 'vertical' ? 'hover:bg-blue-700' : 'hover:bg-blue-600'} transition-colors"
							on:click={() => setArrangement('vertical')}
						>
							Vertical
						</button>
					</div>
				</div>
				
				<div>
					<h3 class="font-semibold mb-3">Card Flip Controls</h3>
					<div class="space-y-2">
						<button 
							class="w-full px-4 py-2 {flipEnabled ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'} rounded-lg {flipEnabled ? 'hover:bg-purple-700' : 'hover:bg-purple-600'} transition-colors"
							on:click={toggleFlipEnabled}
						>
							{flipEnabled ? 'Disable' : 'Enable'} Click to Flip
						</button>
						<button 
							class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
							on:click={() => setInitialState('face')}
						>
							Start All Face Up
						</button>
						<button 
							class="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
							on:click={() => setInitialState('back')}
						>
							Start All Face Down
						</button>
						<button 
							class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
							on:click={flipAllToFace}
							disabled={!flipEnabled}
						>
							Flip All to Face
						</button>
						<button 
							class="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
							on:click={flipAllToBack}
							disabled={!flipEnabled}
						>
							Flip All to Back
						</button>
						<button 
							class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
							on:click={startAutoFlip}
							disabled={!flipEnabled}
						>
							Auto Flip (7s)
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Show/Hide Demo Button -->
		<div class="mt-6 text-center">
			<button 
				class="px-6 py-3 {showDemo ? 'bg-red-500 text-white' : 'bg-purple-500 text-white'} font-bold rounded-xl {showDemo ? 'hover:bg-red-600' : 'hover:bg-purple-600'} transition-colors transform hover:scale-105"
				on:click={toggleDemo}
			>
				{showDemo ? 'Hide Demo' : 'Show Demo'}
			</button>
		</div>

		<!-- Demo Display -->
		{#if showDemo}
			<section class="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
				<h2 class="text-2xl font-bold mb-6 text-center">Sample Hand Display</h2>
				<p class="text-center text-gray-600 mb-6">
					Current: {currentDisplayMode} display, {currentArrangement} arrangement
					{#if flipEnabled}
						<br />
						Flip: {initialState === 'face' ? 'Face Up' : 'Face Down'} - Click to flip enabled
					{/if}
				</p>
				
				<!-- Hand Display Component -->
				<HandDisplay 
					bind:this={handDisplayRef}
					{cards} 
					{displayOptions}
				/>
				
				<div class="mt-6 text-center">
					<button 
						class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
						on:click={regenerateHand}
					>
						Generate New Hand
					</button>
				</div>
			</section>
		{:else}
			<section class="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
				<p class="text-gray-600">Click "Show Demo" to display a sample bridge hand</p>
			</section>
		{/if}
	</div>
</div>
