<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import type { Card as BridgeCard } from '$lib/types/bridge';

	// Game state using Svelte 5 runes
	let gameMode = $state<'manual' | 'automated'>('manual');
	let gameStarted = $state<boolean>(false);
	let gameCompleted = $state<boolean>(false);  // Track if game is completed
	let flipInterval = $state<number>(2.0);  // Time between card flips in seconds
	let isAutoFlipping = $state<boolean>(false);  // Track if auto flipping is active
	let autoFlipInterval: number | null = null;  // Store interval ID
	let flipSequence = $state<'random' | 'ordered'>('ordered');  // Choose flip sequence
	let manuallyClickedCards = $state<string[]>([]);  // Track all cards clicked in manual mode
	// Track cards clicked in different sections
	let handCardFlippedIds = $state<string[]>([]);  // Cards clicked in "Your Hand"
	let allPossibleCardFlippedIds = $state<string[]>([]);  // Cards clicked in "All Possible Cards"
	let correctlyMatchedCards = $state<string[]>([]);  // Cards correctly matched and should stay face up
	
	// For backward compatibility, keep flippedCardIds as the union of both
	let flippedCardIds = $derived(() => [...handCardFlippedIds, ...allPossibleCardFlippedIds]);
	let incorrectCount = $state<number>(0);
	let attemptCount = $state<number>(0);
	let feedbackMessage = $state<string>('');
	let isProcessing = $state<boolean>(false);
	let autoFlipTimer = $state<number | null>(null);
	let currentFlippedCard = $state<string | null>(null);
	let allCardsFlippedOnce = $state<boolean>(false);
	let lastCardFlippedBack = $state<boolean>(false);

	// Navigation functions
	function goToTrackCardsPlayed() {
		goto('/bridge-memory/track-cards-played');
	}

	function goToBridgeMemory() {
		goto('/bridge-memory');
	}

	function goToMain() {
		goto('/');
	}

	// Simple test counter
	let buttonClickCount = $state<number>(0);

	// Basic test - should always show current state
	$effect(() => {
		console.log('🧪 Component test - gameStarted:', gameStarted);
		console.log('🧪 Component test - gameCompleted:', gameCompleted);
		console.log('🧪 Component test - flippedCardIds:', flippedCardIds);
		console.log('🧪 Component test - correctlyMatchedCards:', correctlyMatchedCards);
	});

	// Card data for Game 3-2 (4 hands)
	let hand1Cards = $state<BridgeCard[]>([]);
	let hand2Cards = $state<BridgeCard[]>([]);
	let hand3Cards = $state<BridgeCard[]>([]);
	let hand4Cards = $state<BridgeCard[]>([]);
	let allPossibleCards = $state<BridgeCard[]>([]);

	// Initialize cards
	function initializeCards() {
		// Create all 52 cards
		const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
		const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
		
		allPossibleCards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				allPossibleCards.push({ suit, rank });
			}
		}

		// Shuffle and distribute all 52 cards into 4 hands (13 cards each)
		const shuffled = [...allPossibleCards].sort(() => Math.random() - 0.5);
		hand1Cards = shuffled.slice(0, 13);
		hand2Cards = shuffled.slice(13, 26);
		hand3Cards = shuffled.slice(26, 39);
		hand4Cards = shuffled.slice(39, 52);
		
		console.log('🎴 Game 3-2 Cards initialized - 4 hands with 13 cards each');
		console.log('🎴 Hand 1 (North):', hand1Cards.length, 'cards');
		console.log('🎴 Hand 2 (East):', hand2Cards.length, 'cards');
		console.log('🎴 Hand 3 (South):', hand3Cards.length, 'cards');
		console.log('🎴 Hand 4 (West):', hand4Cards.length, 'cards');
		console.log('🎴 Total cards distributed:', hand1Cards.length + hand2Cards.length + hand3Cards.length + hand4Cards.length);
	}

	// Start the game
	function startGame() {
		console.log('🎮 Starting Game 3-2');
		gameStarted = true;
		gameCompleted = false;
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		
		// For Game 3-2: Declarer and Dummy hands are face-up by default
		// Add all cards from Declarer (hand4) and Dummy (hand1) to correctly matched cards
		const declarerAndDummyCards = [...hand1Cards, ...hand4Cards];
		correctlyMatchedCards = declarerAndDummyCards.map(card => `${card.suit}-${card.rank}`);
		console.log('🎴 Declarer and Dummy cards set as face-up:', correctlyMatchedCards.length, 'cards');
		
		// Add Declarer and Dummy cards to handCardFlippedIds so they appear face-up
		handCardFlippedIds = [...correctlyMatchedCards];
	}

	// Reset the game
	function resetGame() {
		console.log('🔄 Resetting Game 3-2');
		gameStarted = false;
		gameCompleted = false;
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		manuallyClickedCards = [];
		handCardFlippedIds = [];
		allPossibleCardFlippedIds = [];
		correctlyMatchedCards = [];
		isAutoFlipping = false;
		if (autoFlipInterval) {
			clearInterval(autoFlipInterval);
			autoFlipInterval = null;
		}
		if (autoFlipTimer) {
			clearTimeout(autoFlipTimer);
			autoFlipTimer = null;
		}
		allCardsFlippedOnce = false;
		lastCardFlippedBack = false;
		initializeCards();
	}

	// Handle card clicks in manual mode
	function handleCardClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		if (!gameStarted || gameCompleted || isAutoFlipping) return;

		const cardId = `${suit}-${rank}`;
		console.log(`🎴 Card clicked: ${cardId}`);
		
		// Check if card is already correctly matched
		if (correctlyMatchedCards.includes(cardId)) {
			console.log('🎴 Card already correctly matched, ignoring click');
			return;
		}

		// Check if card is already flipped
		if (flippedCardIds.includes(cardId)) {
			console.log('🎴 Card already flipped, ignoring click');
			return;
		}

		// Add to manually clicked cards
		manuallyClickedCards = [...manuallyClickedCards, cardId];

		// Determine which hand the card belongs to (check all 4 hands)
		const allHands = [...hand1Cards, ...hand2Cards, ...hand3Cards, ...hand4Cards];
		const isInAnyHand = allHands.some(card => card.suit === suit && card.rank === rank);
		
		if (isInAnyHand) {
			handCardFlippedIds = [...handCardFlippedIds, cardId];
		} else {
			allPossibleCardFlippedIds = [...allPossibleCardFlippedIds, cardId];
		}

		// Increment attempt count
		attemptCount++;

		// Check if this is a correct match
		const isCorrectMatch = isInAnyHand;
		
		if (isCorrectMatch) {
			// Add to correctly matched cards
			correctlyMatchedCards = [...correctlyMatchedCards, cardId];
			feedbackMessage = 'Correct! Card stays face up.';
			
			// Check if game is completed (all 52 cards found)
			if (correctlyMatchedCards.length === 52) {
				gameCompleted = true;
				feedbackMessage = `🎉 Congratulations! You found all 52 cards in ${attemptCount} attempts!`;
			}
		} else {
			// Incorrect match - flip back after delay
			incorrectCount++;
			feedbackMessage = 'Incorrect. Card will flip back.';
			
			// Set timer to flip back
			setTimeout(() => {
				if (isInAnyHand) {
					handCardFlippedIds = handCardFlippedIds.filter(id => id !== cardId);
				} else {
					allPossibleCardFlippedIds = allPossibleCardFlippedIds.filter(id => id !== cardId);
				}
				
				// Clear feedback message after a short delay
				setTimeout(() => {
					if (feedbackMessage === 'Incorrect. Card will flip back.') {
						feedbackMessage = '';
					}
				}, 1000);
			}, 1500);
		}

		// Clear feedback message after delay
		setTimeout(() => {
			if (feedbackMessage === 'Correct! Card stays face up.') {
				feedbackMessage = '';
			}
		}, 2000);
	}

	// Create a card click handler
	function createCardClickHandler(suit: string, rank: string) {
		return () => {
			handleCardClick(suit as 'hearts' | 'diamonds' | 'clubs' | 'spades', rank);
		};
	}

	// Initialize game on mount
	onMount(() => {
		console.log('🚀 Game 3 component mounted');
		initializeCards();
		startGame(); // Auto-start the game like in Game 1
	});

	// Sort cards by suit and rank
	function sortCards(cards: BridgeCard[]): BridgeCard[] {
		const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
		const rankOrder = { 'A': 0, 'K': 1, 'Q': 2, 'J': 3, '10': 4, '9': 5, '8': 6, '7': 7, '6': 8, '5': 9, '4': 10, '3': 11, '2': 12 };
		
		return cards.sort((a, b) => {
			const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
			if (suitDiff !== 0) return suitDiff;
			return rankOrder[a.rank] - rankOrder[b.rank];
		});
	}

	// Check if a card is flipped
	function isCardFlipped(cardId: string): boolean {
		return flippedCardIds.includes(cardId) || correctlyMatchedCards.includes(cardId);
	}

	// Check if a card is correctly matched
	function isCardCorrectlyMatched(cardId: string): boolean {
		return correctlyMatchedCards.includes(cardId);
	}

	// Handle card click in "All Possible Cards" section
	function handleAllPossibleCardsClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		console.log('🎯 ALL POSSIBLE CARDS CLICK FUNCTION CALLED!');
		if (gameMode !== 'manual') {
			console.log('❌ Not in manual mode, returning');
			return;
		}
		
		const cardId = `${suit}-${rank}`;
		console.log('=== ALL POSSIBLE CARDS CLICK ===');
		console.log('Card ID:', cardId);
		console.log('Game mode:', gameMode);
		
		// Check if allowed (all hand cards clicked and last card face down)
		console.log('🔍 All Possible Cards check:');
		console.log('  allCardsFlippedOnce:', allCardsFlippedOnce);
		console.log('  lastCardFlippedBack:', lastCardFlippedBack);
		console.log('  currentFlippedCard:', currentFlippedCard);
		console.log('  handCardFlippedIds:', [...handCardFlippedIds]);
		
		if (!allCardsFlippedOnce || !lastCardFlippedBack) {
			console.log('❌ Conditions not met for All Possible Cards');
			if (!allCardsFlippedOnce) {
				console.log('  - Not all cards have been clicked once');
			}
			if (!lastCardFlippedBack) {
				console.log('  - Last card has not been flipped back face down');
			}
			feedbackMessage = 'You must first flip all cards in "Your Hand" at least once,\nand flip the last card back face down before clicking cards in "All Possible Cards".';
			setTimeout(() => {
				feedbackMessage = '';
			}, 5000);
			return;
		}
		
		// Increment attempt count for clicks on "All Possible Cards"
		attemptCount++;
		
		// Check if already flipped in All Possible Cards
		if (allPossibleCardFlippedIds.includes(cardId)) {
			feedbackMessage = 'Card already revealed!';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
			return;
		}
		
		// Check if this card matches any card in "Your Hand" (check all 4 hands)
		const allHands = [...hand1Cards, ...hand2Cards, ...hand3Cards, ...hand4Cards];
		const matchingHandCard = allHands.find(handCard => 
			handCard.suit === suit && handCard.rank === rank
		);
		
		if (matchingHandCard) {
			// Correct choice - card matches one in "Your Hand"
			console.log('✅ Correct choice! Card matches hand card:', matchingHandCard);
			feedbackMessage = 'Correct Choice!';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
			
			// Add to correctly matched cards
			correctlyMatchedCards = [...correctlyMatchedCards, cardId];
			
			// Add to All Possible Cards flipped IDs
			allPossibleCardFlippedIds = [...allPossibleCardFlippedIds, cardId];
			
			// Check if game is completed (all 52 cards found)
			const totalCardsInAllHands = hand1Cards.length + hand2Cards.length + hand3Cards.length + hand4Cards.length;
			if (correctlyMatchedCards.length >= totalCardsInAllHands) {
				console.log('🎉 ALL CARDS MATCHED! Game completed!');
				gameCompleted = true;
				feedbackMessage = 'Congratulations - You Remembered all of the cards in all four hands!\nGame Over - Restart to play again.';
			} else {
				console.log('Not completed yet - need more matches');
			}
		} else {
			// Incorrect choice - card doesn't match any in "Your Hand"
			console.log('❌ Incorrect choice! No matching card in hand');
			feedbackMessage = 'Incorrect Choice!';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
			
			// Add to All Possible Cards flipped IDs
			allPossibleCardFlippedIds = [...allPossibleCardFlippedIds, cardId];
		}
	}

	// Check if an All Possible Card is flipped
	function isAllPossibleCardFlipped(cardId: string): boolean {
		return allPossibleCardFlippedIds.includes(cardId);
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
	<div class="max-w-6xl mx-auto">
		<!-- Breadcrumb Navigation -->
		<nav class="mb-6">
			<ol class="flex items-center space-x-2 text-sm text-gray-600">
				<li>
					<button 
						onclick={goToMain}
						class="hover:text-emerald-600 transition-colors font-medium"
					>
						Home
					</button>
				</li>
				<li class="flex items-center">
					<span class="mx-2">/</span>
					<button 
						onclick={goToBridgeMemory}
						class="hover:text-emerald-600 transition-colors font-medium"
					>
						Bridge Memory
					</button>
				</li>
				<li class="flex items-center">
					<span class="mx-2">/</span>
					<button 
						onclick={goToTrackCardsPlayed}
						class="hover:text-emerald-600 transition-colors font-medium"
					>
						Track Cards Played
					</button>
				</li>
				<li class="flex items-center">
					<span class="mx-2">/</span>
					<span class="text-emerald-600 font-medium">Four Hands (declarer and dummy face-up)</span>
				</li>
			</ol>
		</nav>

		<!-- Page Header -->
		<header class="text-center mb-8">
			<h1 class="text-4xl font-bold text-emerald-800 mb-2">Four Hands (declarer and dummy face-up)</h1>
			<p class="text-gray-600">Track and memorize cards across four hands with declarer and dummy visible</p>
		</header>

		<!-- Game Stats -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
				<div class="bg-emerald-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-emerald-600">{attemptCount}</div>
					<div class="text-sm text-gray-600">Attempts</div>
				</div>
				<div class="bg-red-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-red-600">{incorrectCount}</div>
					<div class="text-sm text-gray-600">Incorrect</div>
				</div>
				<div class="bg-blue-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-blue-600">{correctlyMatchedCards.length}</div>
					<div class="text-sm text-gray-600">Found</div>
				</div>
				<div class="bg-purple-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-purple-600">{hand1Cards.length + hand2Cards.length + hand3Cards.length + hand4Cards.length - correctlyMatchedCards.length}</div>
					<div class="text-sm text-gray-600">Remaining</div>
				</div>
			</div>
		</div>

		<!-- Feedback Message -->
		{#if feedbackMessage}
			<div class="bg-white rounded-xl shadow-lg p-4 mb-6 text-center">
				<div class="text-lg font-medium {feedbackMessage.includes('Correct') ? 'text-green-600' : 'text-red-600'}">
					{feedbackMessage}
				</div>
			</div>
		{/if}

		<!-- Game Controls -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="flex flex-wrap gap-4 justify-center">
				{#if !gameStarted}
					<button 
						onclick={startGame}
						class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
					>
						Start Memory Challenge
					</button>
				{:else}
					<button 
						onclick={resetGame}
						class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
					>
						Reset Game
					</button>
				{/if}
			</div>
		</div>

		<!-- Game Area -->
		{#if gameStarted}
			<div class="space-y-8">
				<!-- Game Instructions -->
				<div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
					<h3 class="text-lg font-semibold text-blue-800 mb-2">Game Instructions:</h3>
					<ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
						<li>Click cards in "Your Hand" to flip them face up (one at a time)</li>
						<li>Click another card to flip the current card back face down and flip the new card</li>
						<li>Click the same card again to flip it back face down</li>
						<li>You must flip all cards in "Your Hand" at least once</li>
						<li>After flipping the last card back face down, you can click cards in "All Possible Cards"</li>
						<li>Each card can only be flipped once in "Your Hand"</li>
					</ol>
				</div>

				<!-- Game Status -->
				<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
					<div class="flex justify-between items-center mb-6">
						<div class="flex items-center space-x-4">
							<div class="text-lg font-semibold text-gray-700">
								{#if gameCompleted}
									<span class="text-green-600">🎉 Game Completed!</span>
								{:else if allCardsFlippedOnce && lastCardFlippedBack}
									<span class="text-blue-600">🎯 Click cards in "All Possible Cards" to find matches</span>
								{:else if allCardsFlippedOnce}
									<span class="text-orange-600">🔄 Click the last card again to flip it face down</span>
								{:else}
									<span class="text-emerald-600">👆 Click cards in "Your Hand" to memorize them</span>
								{/if}
							</div>
						</div>
						<div class="flex space-x-4">
							{#if !gameCompleted}
								<button 
									onclick={resetGame}
									class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
								>
									Reset Game
								</button>
							{/if}
						</div>
					</div>

					{#if gameCompleted}
						<div class="text-center">
							<div class="text-lg font-bold text-green-600 mb-3 whitespace-pre-line">
								Congratulations - You Remembered all of the cards in your hand!
							</div>
							<div class="text-lg font-semibold text-blue-600 mb-4">
								Game Over - Restart to play again
							</div>
							<button 
								onclick={resetGame}
								class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
							>
								Play Again
							</button>
						</div>
					{:else}
						<!-- Four Hands Layout - Square arrangement -->
						<div class="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
							<!-- Top Left - Hand 1 (North) -->
							<div class="col-start-2 row-start-1">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">Dummy</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											{@const suitCards = hand1Cards.filter(card => card.suit === suit)}
											{#if suitCards.length > 0}
												<div class="flex flex-wrap gap-1 justify-center">
													{#each suitCards.sort((a, b) => {
														const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
														return rankOrder[b.rank] - rankOrder[a.rank];
													}) as card}
														{@const cardId = `${card.suit}-${card.rank}`}
														{@const isFlipped = handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId)}
														<Card 
															card={card}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={isFlipped}
															clickable={true}
															onClick={() => handleCardClick(card.suit, card.rank)}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Left Middle - Hand 2 (West) -->
							<div class="col-start-1 row-start-2">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">West Opponent</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											{@const suitCards = hand2Cards.filter(card => card.suit === suit)}
											{#if suitCards.length > 0}
												<div class="flex flex-wrap gap-1 justify-center">
													{#each suitCards.sort((a, b) => {
														const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
														return rankOrder[b.rank] - rankOrder[a.rank];
													}) as card}
														{@const cardId = `${card.suit}-${card.rank}`}
														{@const isFlipped = handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId)}
														<Card 
															card={card}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={isFlipped}
															clickable={true}
															onClick={() => handleCardClick(card.suit, card.rank)}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Right Middle - Hand 3 (East) -->
							<div class="col-start-3 row-start-2">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">East Opponent</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											{@const suitCards = hand3Cards.filter(card => card.suit === suit)}
											{#if suitCards.length > 0}
												<div class="flex flex-wrap gap-1 justify-center">
													{#each suitCards.sort((a, b) => {
														const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
														return rankOrder[b.rank] - rankOrder[a.rank];
													}) as card}
														{@const cardId = `${card.suit}-${card.rank}`}
														{@const isFlipped = handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId)}
														<Card 
															card={card}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={isFlipped}
															clickable={true}
															onClick={() => handleCardClick(card.suit, card.rank)}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Bottom Middle - Hand 4 (South) -->
							<div class="col-start-2 row-start-3">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">Declarer</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											{@const suitCards = hand4Cards.filter(card => card.suit === suit)}
											{#if suitCards.length > 0}
												<div class="flex flex-wrap gap-1 justify-center">
													{#each suitCards.sort((a, b) => {
														const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
														return rankOrder[b.rank] - rankOrder[a.rank];
													}) as card}
														{@const cardId = `${card.suit}-${card.rank}`}
														{@const isFlipped = handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId)}
														<Card 
															card={card}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={isFlipped}
															clickable={true}
															onClick={() => handleCardClick(card.suit, card.rank)}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Center - All Possible Cards -->
							<div class="col-start-2 row-start-2 flex items-center justify-center">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full max-w-sm">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">All Possible Cards</h3>
									<div class="space-y-1 max-h-80 overflow-y-auto">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											<div class="flex flex-wrap gap-1 justify-center">
												{#each ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as rank}
													{@const cardId = `${suit}-${rank}`}
													{@const isFlipped = isAllPossibleCardFlipped(cardId)}
													{#if !isFlipped}
														<button
															onclick={() => handleAllPossibleCardsClick(suit, rank)}
															class="px-2 py-1 text-xs font-semibold rounded border transition-all duration-150 min-w-[2rem] h-[1.8rem] {suit === 'hearts' || suit === 'diamonds' ? 'text-red-600 border-red-300' : 'text-black border-gray-300'} hover:bg-gray-50 hover:shadow-lg"
														>
															{#if suit === 'spades'}♠{:else if suit === 'hearts'}♥{:else if suit === 'clubs'}♣{:else if suit === 'diamonds'}♦{/if}{rank}
														</button>
													{:else}
														<div class="px-2 py-1 text-xs font-semibold rounded border min-w-[2rem] h-[1.8rem] flex items-center justify-center {suit === 'hearts' || suit === 'diamonds' ? 'bg-red-100 border-red-400 text-red-800' : 'bg-gray-100 border-gray-400 text-gray-600'}">
															{#if suit === 'spades'}♠{:else if suit === 'hearts'}♥{:else if suit === 'clubs'}♣{:else if suit === 'diamonds'}♦{/if}{rank}
														</div>
													{/if}
												{/each}
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Bottom Navigation -->
		<div class="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 mt-8 space-y-2">
			<div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
				<button 
					class="px-4 py-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={goToMain}
				>
					Main Menu
				</button>
				<button 
					class="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={goToBridgeMemory}
				>
					Bridge Memory App
				</button>
				<button 
					class="px-4 py-2 bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={goToTrackCardsPlayed}
				>
					Track Cards Played
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Add any custom styles here */
</style>
