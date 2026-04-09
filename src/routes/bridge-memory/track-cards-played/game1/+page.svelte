<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import type { Card as BridgeCard } from '$lib/types/bridge';
	
	// Navigation functions
	function goToMain() {
		goto('/');
	}
	
	function goToBridgeMemory() {
		goto('/bridge-memory');
	}
	
	function goToTrackCardsPlayed() {
		goto('/bridge-memory/track-cards-played');
	}
	
	function goToGame2() {
		goto('/bridge-memory/track-cards-played/game2');
	}
	
	// Game state
	let gameMode: 'manual' | 'timed' = 'manual';
	let displayTime: number = 5;
	let gameStarted: boolean = false;
	let cardsRevealed: boolean = false;
	let cardsRevealedOnce: boolean = false; // Track if cards have been revealed once
	let gamePhase: 'setup' | 'memorize' | 'test' = 'setup'; // Track game phase
	let timer: number | null = null;
	
	// Card data
	let handCards: BridgeCard[] = [];
	let allPossibleCards: BridgeCard[] = [];
	let incorrectCount: number = 0;
	let attemptCount: number = 0;
	let feedbackMessage: string = '';
	
	// Track individual card states for revealed cards
	let revealedCardIds: string[] = [];
	let clickedCardIds: string[] = []; // Track which cards have been clicked
	let correctlyClickedCardIds: string[] = []; // Track correctly clicked cards for hand display
	
	// Computed property to check if a card is clicked
	$: isCardClicked = (cardId: string) => {
		const result = clickedCardIds.includes(cardId);
		console.log(`isCardClicked(${cardId}): ${result}, clickedCardIds: [${clickedCardIds.join(', ')}]`);
		return result;
	};
	
	// Initialize cards
	function initializeGame() {
		// Generate a random hand of 13 cards (standard bridge hand)
		const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['spades', 'hearts', 'diamonds', 'clubs'];
		const ranks: ('2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A')[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		
		// Create all possible cards
		allPossibleCards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				allPossibleCards.push({
					suit,
					rank
				});
			}
		}
		
		// Generate random hand
		handCards = [];
		const shuffledCards = [...allPossibleCards].sort(() => Math.random() - 0.5);
		for (let i = 0; i < 13; i++) {
			const card = shuffledCards[i];
			handCards.push({...card});
		}
	}
	
	// Start game with selected mode
	function startGame() {
		gameStarted = true;
		gamePhase = 'setup'; // Reset to setup phase
		cardsRevealed = false; // Cards start face-down
		cardsRevealedOnce = false; // Reset revealed once state
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		revealedCardIds = []; // Reset revealed cards
		clickedCardIds = []; // Reset clicked cards
		initializeGame();
	}
	
	// Reveal cards (for both Manual and Timed modes)
	function revealCards() {
		cardsRevealed = true;
		cardsRevealedOnce = true; // Mark that cards have been revealed once
		gamePhase = 'memorize'; // Change to memorize phase
		
		if (gameMode === 'timed') {
			// Start timer to hide cards automatically
			console.log(`Starting timer with displayTime: ${displayTime} seconds`);
			timer = setTimeout(() => {
				console.log('Timer expired - hiding cards');
				hideCards();
			}, displayTime * 1000);
		}
		// For Manual mode, cards stay revealed until Hide Cards is clicked
	}
	
	// Hide cards
	function hideCards() {
		console.log('hideCards() called - setting cardsRevealed to false');
		gamePhase = 'test'; // Change to test phase
		cardsRevealed = false;
		revealedCardIds = []; // Reset revealed cards
		
		if (timer) {
			console.log('Clearing timer');
			clearTimeout(timer);
			timer = null;
		}
	}
	
	// Handle card click in memory test
	function handleCardClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		if (cardsRevealed || gamePhase !== 'test') return; // Only allow clicking in test phase
		
		// Increment attempt count for EVERY click
		attemptCount++;
		
		// Check if this card is in hand
		const cardId = `${suit}-${rank}`;
		const isInHand = handCards.some(handCard => 
			handCard.suit === suit && handCard.rank === rank
		);
		
		console.log(`Card clicked: ${cardId}, Is in hand: ${isInHand}`);
		console.log(`Current clickedCardIds: [${clickedCardIds.join(', ')}]`);
		console.log(`Checking if ${cardId} is in clickedCardIds: ${clickedCardIds.includes(cardId)}`);
		
		if (isInHand) {
			// Correct - add to revealed cards AND clicked cards
			if (!revealedCardIds.includes(cardId)) {
				revealedCardIds = [...revealedCardIds, cardId];
			}
			// Add to clickedCardIds if not already there
			if (!clickedCardIds.includes(cardId)) {
				clickedCardIds = [...clickedCardIds, cardId];
				console.log(`Added to clickedCardIds: [${clickedCardIds.join(', ')}]`);
			}
			console.log('Card revealed:', cardId, 'Total revealed:', revealedCardIds.length);
			feedbackMessage = 'Correct!';
		} else {
			// Incorrect - DON'T add to clicked cards (only track correct ones)
			incorrectCount++;
			feedbackMessage = 'Card not in hand';
		}
		
		// Clear feedback after 2 seconds
		setTimeout(() => {
			feedbackMessage = '';
		}, 2000);
	}
	
	// Helper functions for card display (copied from HandDisplay component)
	function getSuitSymbol(suit: string): string {
		switch (suit) {
			case 'S': return '♠';
			case 'H': return '♥';
			case 'D': return '♦';
			case 'C': return '♣';
			default: return '';
		}
	}

	function getSuitColor(suit: string): string {
		return (suit === 'H' || suit === 'D') ? 'text-red-500' : 'text-black';
	}

	function getRankDisplay(rank: string): string {
		switch (rank) {
			case 'A': return 'A';
			case 'J': return 'J';
			case 'Q': return 'Q';
			case 'K': return 'K';
			default: return rank;
		}
	}

	function getCardColor(card: Card): string {
		return (card.suit === 'H' || card.suit === 'D') ? 'border-red-400 bg-red-50' : 'border-black bg-gray-50';
	}

	// Sort cards by suit (spades, hearts, clubs, diamonds) and rank (Ace to 2)
	function sortCards(cards: BridgeCard[]): BridgeCard[] {
		const suitOrder: Record<string, number> = { 'spades': 0, 'hearts': 1, 'clubs': 2, 'diamonds': 3 };
		const rankOrder: Record<string, number> = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };
		
		return [...cards].sort((a, b) => {
			const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
			if (suitDiff !== 0) return suitDiff;
			
			return rankOrder[b.rank] - rankOrder[a.rank];
		});
	}
	
	// Check if a card is in the hand
	function isCardInHand(card: BridgeCard): boolean {
		return handCards.some(handCard => 
			handCard.suit === card.suit && handCard.rank === card.rank
		);
	}
	
	// Handle click on All Possible Cards
	function handleAllPossibleCardClick(card: BridgeCard) {
		// Only allow clicks after cards have been revealed and then hidden (game is active)
		// Cards should be clickable when they are face-down (cardsRevealed = false) after being revealed once
		if (cardsRevealed) return;
		
		// Check if game has been revealed at least once
		if (!cardsRevealedOnce) return;
		
		// Create card ID
		const cardId = `${card.suit}-${card.rank}`;
		
		// Check if card has already been clicked
		if (clickedCardIds.includes(cardId)) return;
		
		// Add to clicked cards
		clickedCardIds = [...clickedCardIds, cardId];
		
		// Increment attempts
		attemptCount++;
		
		// Check if card is in hand
		if (isCardInHand(card)) {
			feedbackMessage = 'Correct';
			// Add to correctly clicked cards for hand display
			correctlyClickedCardIds = [...correctlyClickedCardIds, cardId];
		} else {
			feedbackMessage = 'Incorrect - not in the Hand';
			incorrectCount++;
		}
		
		// Clear feedback after delay
		setTimeout(() => {
			feedbackMessage = '';
		}, 2000);
	}
	
	// Helper function to handle card clicks
	function createCardClickHandler(suit: string, rank: string) {
		return () => {
			handleCardClick(suit as 'hearts' | 'diamonds' | 'clubs' | 'spades', rank);
		};
	}
	
	// Reset game
	function resetGame() {
		gameStarted = false;
		cardsRevealed = false;
		cardsRevealedOnce = false;
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		revealedCardIds = []; // Reset revealed cards
		clickedCardIds = []; // Reset clicked cards
		correctlyClickedCardIds = []; // Reset correctly clicked cards
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		initializeGame();
		startGame();
	}
	
	onMount(() => {
		initializeGame();
		startGame();
	});
	
	// Reactive statement to ensure template updates
	$: {
		console.log('Reactive update - revealedCardIds:', revealedCardIds, 'length:', revealedCardIds?.length);
		console.log('Reactive update - cardsRevealed:', cardsRevealed);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
	<!-- Top Navigation -->
	<header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<div class="flex items-center justify-center flex-1">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
						<span class="text-white text-xl">🃏</span>
					</div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-center">
						Track Cards Played - Game 1
					</h1>
				</div>
			</div>
		</div>
	</header>

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
					<button 
						onclick={goToTrackCardsPlayed}
						class="text-teal-600 hover:text-teal-800 transition-colors font-medium"
					>
						Track Cards Played
					</button>
					<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</li>
				<li class="flex items-center">
					<span class="text-purple-600 font-semibold">Game 1</span>
				</li>
			</ol>
		</nav>

		{#if !gameStarted}
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-emerald-100 p-8">
				<h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Simultaneous Full Hand Memory Challenge</h2>
				
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<!-- Left Column: Game Setup -->
					<div class="space-y-6">
						<h3 class="text-xl font-semibold mb-4 text-gray-700">Choose Game Mode:</h3>
						<div class="space-y-3">
							<label class="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors {gameMode === 'manual' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}">
								<input 
									type="radio" 
									bind:group={gameMode} 
									value="manual" 
									class="w-4 h-4 text-emerald-600"
								/>
								<div>
									<span class="font-semibold">Manual Mode</span>
									<p class="text-sm text-gray-600">Click to reveal cards, click again to hide them</p>
								</div>
							</label>
							
							<label class="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors {gameMode === 'timed' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}">
								<input 
									type="radio" 
									bind:group={gameMode} 
									value="timed" 
									class="w-4 h-4 text-emerald-600"
								/>
								<div>
									<span class="font-semibold">Timed Mode</span>
									<p class="text-sm text-gray-600">Cards reveal for a fixed time, then hide automatically</p>
								</div>
							</label>
						</div>
						
						{#if gameMode === 'timed'}
							<div>
								<h3 class="text-xl font-semibold mb-4 text-gray-700">Display Time (seconds):</h3>
								<input 
									type="number" 
									bind:value={displayTime} 
									min="1" 
									max="30" 
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
								/>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<!-- Game Play Area -->
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-emerald-100 p-6 mb-6">
				<!-- Game Mode Selection -->
				<div class="mb-6">
					<h3 class="text-lg font-semibold text-gray-700 mb-3">Game Mode</h3>
					<div class="flex space-x-6 items-center">
						<label class="flex items-center space-x-2 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								bind:group={gameMode} 
								value="manual"
								class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-gray-700 font-medium">Manual Mode</span>
						</label>
						<label class="flex items-center space-x-2 cursor-pointer">
							<input 
								type="radio" 
								name="gameMode" 
								bind:group={gameMode} 
								value="timed"
								class="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
							/>
							<span class="text-gray-700 font-medium">Timed Mode</span>
						</label>
						
						<!-- Reset Game Button -->
						<button 
							onclick={resetGame}
							class="ml-8 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
						>
							Reset Game
						</button>
					</div>
					{#if gameMode === 'timed'}
						<div class="mt-3">
							<label for="display-time" class="block text-sm font-medium text-gray-700 mb-1">Display Time (seconds):</label>
							<input 
								id="display-time"
								type="number" 
								bind:value={displayTime} 
								min="1" 
								max="30" 
								class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
							/>
						</div>
					{/if}
				</div>
				
				<div class="flex justify-between items-center">
					<div class="flex space-x-4">
						{#if !cardsRevealed}
							<button 
								onclick={revealCards}
								class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
							>
								Reveal Cards
							</button>
						{:else if gameMode === 'manual'}
							<button 
								onclick={hideCards}
								class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
							>
								Hide Cards
							</button>
						{/if}
					</div>
					
					<div class="text-right">
						<div class="flex space-x-4 justify-end">
							<div class="text-2xl font-bold text-red-600">Incorrect: {incorrectCount}</div>
							<div class="text-2xl font-bold text-blue-600">Attempts: {attemptCount}</div>
						</div>
						<div class="h-8 flex items-center justify-end">
							{#if feedbackMessage}
								<div class="text-lg font-medium {feedbackMessage.includes('Correct') ? 'text-green-600' : 'text-red-600'}">
									{feedbackMessage}
								</div>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Main Game Area -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Left: Hand Cards -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-700 mb-3">Hand Cards (13 cards)</h3>
						<!-- Group hand cards by suit and display each suit on a separate line -->
						{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
							<div class="flex gap-1.5 mb-1">
								{#each sortCards(handCards).filter(card => card.suit === suit) as card (card)}
									<Card 
										card={card} 
										size="medium" 
										flipped={cardsRevealed || correctlyClickedCardIds.includes(`${card.suit}-${card.rank}`)}
										bridgeTheme={true}
									/>
								{/each}
							</div>
						{/each}
					</div>
					
					<!-- Right: All Possible Cards -->
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-700 mb-3">All Possible Cards (52 cards)</h3>
						<!-- Group cards by suit and display each suit on a separate line -->
						{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
							<div class="flex gap-1.5 mb-1">
								{#each sortCards(allPossibleCards).filter(card => card.suit === suit) as card (card)}
									<button 
										type="button"
										class="px-2 py-1 text-lg border inline-block hover:bg-gray-100 {card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600 border-red-300' : 'text-black border-gray-300'} {isCardInHand(card) ? 'font-bold' : ''} {isCardClicked(`${card.suit}-${card.rank}`) ? 'bg-blue-200 hover:bg-blue-200' : ''}"
										onclick={() => handleAllPossibleCardClick(card)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												handleAllPossibleCardClick(card);
											}
										}}
										aria-label={`${card.rank} of ${card.suit}`}
										aria-pressed={isCardClicked(`${card.suit}-${card.rank}`)}
									>
										{#if card.suit === 'spades'}&spades;{:else if card.suit === 'hearts'}&hearts;{:else if card.suit === 'diamonds'}&diams;{:else if card.suit === 'clubs'}&clubs;{/if}{card.rank}
									</button>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>	
		<!-- Bottom Navigation - Part of page flow -->
		<div class="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 mt-8 space-y-2">
			<div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
				<button 
					class="px-4 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={() => {
						console.log('Main clicked');
						goto('/');
					}}
				>
					Main Menu
				</button>
				<button 
					class="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={() => {
						console.log('Bridge Memory clicked');
						goto('/bridge-memory');
					}}
				>
					Bridge Memory App
				</button>
				<button 
					class="px-4 py-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={() => {
						console.log('Track Cards Played clicked');
						goto('/bridge-memory/track-cards-played');
					}}
				>
					Track Cards Played
				</button>
			</div>
		</div>

		<style>
			/* All styles handled by Tailwind CSS classes */
		</style>