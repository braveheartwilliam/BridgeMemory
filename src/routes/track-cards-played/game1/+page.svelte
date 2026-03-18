<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import type { Card as BridgeCard } from '$lib/types/bridge';
	
	// Game state
	let gameMode: 'manual' | 'timed' = 'manual';
	let displayTime: number = 5;
	let gameStarted: boolean = false;
	let cardsRevealed: boolean = false;
	let timer: number | null = null;
	
	// Card data
	let handCards: BridgeCard[] = [];
	let allPossibleCards: BridgeCard[] = [];
	let incorrectCount: number = 0;
	let attemptCount: number = 0;
	let feedbackMessage: string = '';
	
	// Track individual card states for revealed cards
	let revealedCardIds: string[] = [];
	
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
		cardsRevealed = false;
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		revealedCardIds = []; // Reset revealed cards
		initializeGame();
	}
	
	// Reveal cards (manual mode)
	function revealCards() {
		cardsRevealed = true;
		if (handDisplayComponent) {
			handDisplayComponent.flipAllToFace();
		}
		
		if (gameMode === 'timed') {
			// Start timer to hide cards
			timer = setTimeout(() => {
				hideCards();
			}, displayTime * 1000);
		}
	}
	
	// Hide cards
	function hideCards() {
		cardsRevealed = false;
		revealedCardIds = []; // Reset revealed cards
		if (handDisplayComponent) {
			handDisplayComponent.flipAllToBack();
		}
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}
	
	// Handle card click in memory test
	function handleCardClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		if (cardsRevealed) return; // Only allow clicking when cards are hidden (face down)
		
		// Increment attempt count for every click
		attemptCount++;
		
		const card: BridgeCard = { suit, rank: rank as any };
		
		// Check if this card is in the hand
		const isInHand = handCards.some(handCard => 
			handCard.suit === card.suit && handCard.rank === card.rank
		);
		
		if (isInHand) {
			// Correct - add to revealed cards and update handCards to trigger individual flip
			const cardId = `${suit}-${rank}`;
			if (!revealedCardIds.includes(cardId)) {
				revealedCardIds = [...revealedCardIds, cardId];
			}
			console.log('Card revealed:', cardId, 'Total revealed:', revealedCardIds.length);
			feedbackMessage = 'Correct!';
		} else {
			// Incorrect
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

	// Sort cards by suit (spades, hearts, diamonds, clubs) and rank (high to low)
	function sortCards(cards: BridgeCard[]): BridgeCard[] {
		const suitOrder: Record<string, number> = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
		const rankOrder: Record<string, number> = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };
		
		return [...cards].sort((a, b) => {
			const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
			if (suitDiff !== 0) return suitDiff;
			
			return rankOrder[b.rank] - rankOrder[a.rank];
		});
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
		incorrectCount = 0;
		feedbackMessage = '';
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}
	
	onMount(() => {
		initializeGame();
	});
	
	// Reactive statement to ensure template updates
	$: {
		console.log('Reactive update - revealedCardIds:', revealedCardIds, 'length:', revealedCardIds?.length);
		console.log('Reactive update - cardsRevealed:', cardsRevealed);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
	<!-- Top Navigation -->
	<header class="bg-white/90 backdrop-blur-md shadow-lg border-b border-emerald-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-20">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
						<span class="text-white text-xl">🃏</span>
					</div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
						Track Cards Played - Game 1
					</h1>
				</div>
				<a 
					href="/track-cards-played" 
					class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
				>
					← Back to Menu
				</a>
			</div>
		</div>
	</header>

	{#if !gameStarted}
		<!-- Game Setup -->
		<div class="max-w-4xl mx-auto px-4 py-8">
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-8">
				<h2 class="text-3xl font-bold text-center mb-8 text-gray-800">Game Setup</h2>
				
				<div class="space-y-6">
					<div>
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
					</div>
					
					{#if gameMode === 'timed'}
						<div>
							<h3 class="text-xl font-semibold mb-4 text-gray-700">Display Time (seconds):</h3>
							<input 
								type="number" 
								bind:value={displayTime} 
								min="1" 
								max="30" 
								class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
							/>
						</div>
					{/if}
					
					<button 
						on:click={startGame}
						class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
					>
						Start Game
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Game Play Area -->
		<div class="max-w-7xl mx-auto px-4 py-8">
			<!-- Game Controls and Feedback -->
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 mb-6">
				<div class="flex justify-between items-center">
					<div class="flex space-x-4">
						{#if !cardsRevealed}
							<button 
								on:click={revealCards}
								class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
							>
								{gameMode === 'manual' ? 'Reveal Cards' : 'Reveal Cards'}
							</button>
						{:else}
							{#if gameMode === 'manual'}
								<button 
									on:click={hideCards}
									class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg"
								>
									Hide Cards
								</button>
							{/if}
						{/if}
					</div>
					
					<div class="text-right">
						<div class="flex space-x-4 justify-end">
							<div class="text-2xl font-bold text-red-600">Incorrect: {incorrectCount}</div>
							<div class="text-2xl font-bold text-blue-600">Attempts: {attemptCount}</div>
						</div>
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
				<!-- Left: Hand Cards (using enhanced Card component) -->
				<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
					<h3 class="text-xl font-bold mb-6 text-gray-800">Your Hand</h3>
					<!-- Card display with vertical arrangement -->
					<div class="flex flex-col space-y-4">
						{#each ['spades', 'hearts', 'diamonds', 'clubs'] as suit}
							<div class="flex space-x-1">
								{#each sortCards(handCards).filter(card => card.suit === suit) as card}
									<Card 
										card={card}
										size="large"
										bridgeTheme={true}
										showBack={cardsRevealed === false && !revealedCardIds.includes(`${card.suit}-${card.rank}`)}
									/>
								{/each}
							</div>
						{/each}
					</div>
				</div>
				
				<!-- Right: All Possible Cards -->
				<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
					<h3 class="text-xl font-bold mb-6 text-gray-800">All Possible Cards</h3>
					<div class="space-y-3">
						{#each ['spades', 'hearts', 'diamonds', 'clubs'] as suit}
							<div class="flex flex-wrap gap-2">
								{#each ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as rank}
									<button
										on:click={createCardClickHandler(suit, rank)}
										disabled={cardsRevealed}
										class="px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all {suit === 'hearts' || suit === 'diamonds' ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-black border-gray-300 hover:bg-gray-50'} {!cardsRevealed ? 'hover:scale-105 cursor-pointer shadow-md' : 'opacity-50 cursor-not-allowed'}"
									>
										{#if suit === 'spades'}♠{:else if suit === 'hearts'}♥{:else if suit === 'diamonds'}♦{:else if suit === 'clubs'}♣{/if}{rank}
									</button>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Bottom Navigation -->
	<footer class="bg-white/90 backdrop-blur-md shadow-lg border-t border-emerald-200 mt-8">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex justify-center">
				<a 
					href="/" 
					class="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
				>
					🏠 Back to Home
				</a>
			</div>
		</div>
	</footer>
</div>

<style>
	/* All styles handled by Tailwind CSS classes */
</style>
