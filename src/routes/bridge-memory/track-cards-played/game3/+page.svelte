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
	let flipSequence = $state<'random' | 'ordered'>('ordered');  // For backward compatibility, keep flippedCardIds as the union of both
	let flippedCardIds = $state<string[]>([]);  // Cards clicked in "Your Hand"
	let allPossibleCardFlippedIds = $state<string[]>([]);  // Cards clicked in "All Possible Cards"
	let correctlyMatchedCards = $state<string[]>([]);  // Cards correctly matched and should stay face up
	let incorrectCount = $state<number>(0);
	let attemptCount = $state<number>(0);
	let feedbackMessage = $state<string>('');
	let isProcessing = $state<boolean>(false);
	let autoFlipTimer = $state<number | null>(null);
	let handCardFlippedIds = $state<string[]>([]);  // Cards clicked in "Your Hand"
	let manuallyClickedCards = $state<string[]>([]);  // Track all cards clicked in manual mode
	let currentFlippedCard = $state<string | null>(null);
	let allCardsFlippedOnce = $state<boolean>(false);
	let lastCardFlippedBack = $state<boolean>(false);
	// Game options state
	let gameOptions = $state('choose-tricks');
	let tricksCount = $state(2);
	let trickDisplayTime = $state(5); // Time a trick is displayed in seconds (default 5)

	// Trick-based gameplay state
	let currentTrick = $state<string[]>([]); // Cards in current trick
	let completedTricks = $state<string[][]>([]); // All completed tricks
	let currentTrickIndex = $state(0); // Index for trick formation
	let trickPhase = $state<'setup' | 'playing' | 'memory' | 'guessing'>('setup'); // Game phase
	let trickTimer = $state<number | null>(null); // Timer for trick display
	let currentSetTricks = $state<string[][]>([]); // Tricks in current memory set
	let tricksInCurrentSet = $state(0); // Count of tricks in current set

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
		
		// Reset counters for new game
		correctlyMatchedCards = [];
		manuallyClickedCards = [];
		handCardFlippedIds = [];
		allPossibleCardFlippedIds = [];
		
		// For Game 3-2: Declarer and Dummy hands are face-up by default
		// Add all cards from Declarer (hand4) and Dummy (hand1) to correctly matched cards
		const declarerAndDummyCards = [...hand1Cards, ...hand4Cards];
		correctlyMatchedCards = declarerAndDummyCards.map(card => `${card.suit}-${card.rank}`);
		console.log('🎴 Declarer and Dummy cards set as face-up:', correctlyMatchedCards.length, 'cards');
		
		// Add Declarer and Dummy cards to handCardFlippedIds so they appear face-up
		handCardFlippedIds = [...correctlyMatchedCards];
		
		// Start trick-based gameplay
		console.log('🃏 Starting trick-based gameplay');
		trickPhase = 'playing';
		currentSetTricks = [];
		tricksInCurrentSet = 0;
		currentTrick = [];
		startTrickFormation();
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
		if (trickTimer) {
			clearTimeout(trickTimer);
			trickTimer = null;
		}
		allCardsFlippedOnce = false;
		lastCardFlippedBack = false;
		
		// Reset trick-based state
		currentTrick = [];
		completedTricks = [];
		currentTrickIndex = 0;
		trickPhase = 'setup';
		currentSetTricks = [];
		tricksInCurrentSet = 0;
		
		initializeCards();
	}

	// Trick-based gameplay functions
	function startNextSetOfTricks() {
		console.log('🎯 Starting next set of tricks');
		trickPhase = 'playing';
		currentSetTricks = [];
		tricksInCurrentSet = 0;
		currentTrick = [];
		startTrickFormation();
	}

	function startTrickFormation() {
		console.log('🃏 Starting trick formation');
		currentTrick = [];
		currentTrickIndex = 0;
		trickPhase = 'playing';
		selectNextCardForTrick();
	}

	function selectNextCardForTrick() {
		console.log('🎴 Selecting next card for trick');
		
		// Order: Declarer -> West Opponent -> Dummy -> East Opponent
		const hands = [
			{ cards: hand4Cards, name: 'Declarer' },
			{ cards: hand2Cards, name: 'West Opponent' },
			{ cards: hand1Cards, name: 'Dummy' },
			{ cards: hand3Cards, name: 'East Opponent' }
		];

		if (currentTrickIndex >= hands.length) {
			// Trick is complete, display it
			displayCurrentTrick();
			return;
		}

		const currentHand = hands[currentTrickIndex];
		const availableCards = currentHand.cards.filter(card => 
			!isCardInCompletedTricks(`${card.suit}-${card.rank}`)
		);

		if (availableCards.length === 0) {
			// No cards left in this hand, skip to next
			currentTrickIndex++;
			selectNextCardForTrick();
			return;
		}

		// Select a random card from available cards
		const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
		const cardId = `${randomCard.suit}-${randomCard.rank}`;
		
		currentTrick.push(cardId);
		removeCardFromHand(randomCard.suit, randomCard.rank);
		
		currentTrickIndex++;
		selectNextCardForTrick();
	}

	function removeCardFromHand(suit: string, rank: string) {
		console.log(`🗑️ Removing ${suit}-${rank} from hand`);
		
		// Remove from each hand's cards
		hand1Cards = hand1Cards.filter(card => !(card.suit === suit && card.rank === rank));
		hand2Cards = hand2Cards.filter(card => !(card.suit === suit && card.rank === rank));
		hand3Cards = hand3Cards.filter(card => !(card.suit === suit && card.rank === rank));
		hand4Cards = hand4Cards.filter(card => !(card.suit === suit && card.rank === rank));
	}

	function isCardInCompletedTricks(cardId: string): boolean {
		return completedTricks.some(trick => trick.includes(cardId));
	}

	function displayCurrentTrick() {
		console.log('👁️ Displaying current trick:', currentTrick);
		
		// Add to completed tricks
		completedTricks.push([...currentTrick]);
		currentSetTricks.push([...currentTrick]);
		tricksInCurrentSet++;
		
		// Set timer to automatically move to next trick
		if (trickTimer) {
			clearTimeout(trickTimer);
		}
		
		trickTimer = setTimeout(() => {
			// Clear current trick after display time
			console.log('🗑️ Removing current trick after display time');
			currentTrick = [];
			
			if (tricksInCurrentSet >= tricksCount) {
				// Memory phase - stop trick formation and start guessing
				trickPhase = 'guessing';
				feedbackMessage = `Memory phase! ${tricksCount} tricks completed. Click cards in "All Possible Cards" to guess the cards.`;
				setTimeout(() => {
					feedbackMessage = '';
				}, 5000);
			} else {
				// Start next trick
				startTrickFormation();
			}
		}, trickDisplayTime * 1000);
	}

	function checkTrickGuess(suit: string, rank: string) {
		console.log('🎯 Checking trick guess:', `${suit}-${rank}`);
		
		const cardId = `${suit}-${rank}`;
		attemptCount++;
		
		// Check if card is in current set of tricks
		const isInTricks = currentSetTricks.some(trick => trick.includes(cardId));
		
		if (isInTricks) {
			feedbackMessage = 'Correct';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
		} else {
			feedbackMessage = 'Incorrect';
			incorrectCount++;
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
		}
		
		// Mark card as clicked in All Possible Cards
		if (!allPossibleCardFlippedIds.includes(cardId)) {
			allPossibleCardFlippedIds = [...allPossibleCardFlippedIds, cardId];
		}
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
		// Game will start when user clicks "Start Memory Game" button
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
		return [...handCardFlippedIds, ...allPossibleCardFlippedIds].includes(cardId) || correctlyMatchedCards.includes(cardId);
	}

	// Check if a card is correctly matched
	function isCardCorrectlyMatched(cardId: string): boolean {
		return correctlyMatchedCards.includes(cardId);
	}
	
	function isAllPossibleCardFlipped(cardId: string): boolean {
		return allPossibleCardFlippedIds.includes(cardId);
	}

	// Handle card click in "All Possible Cards" section
	function handleAllPossibleCardsClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		console.log('🎯 ALL POSSIBLE CARDS CLICK FUNCTION CALLED!');
		
		const cardId = `${suit}-${rank}`;
		console.log('=== ALL POSSIBLE CARDS CLICK ===');
		console.log('Card ID:', cardId);
		console.log('Trick phase:', trickPhase);
		
		// Use trick-based guessing logic if in guessing phase
		if (trickPhase === 'guessing') {
			checkTrickGuess(suit, rank);
			return;
		}
		
		// Original logic for other phases
		if (gameMode !== 'manual') {
			console.log('❌ Not in manual mode, returning');
			return;
		}
		
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
			incorrectCount++;
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
	<div class="w-full mx-auto">
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
					<div class="text-2xl font-bold text-emerald-600">{attemptCount - incorrectCount}</div>
					<div class="text-sm text-gray-600">Found</div>
				</div>
				<div class="bg-purple-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-purple-600">{incorrectCount}</div>
					<div class="text-sm text-gray-600">Remaining</div>
				</div>
				<div class="bg-blue-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-blue-600">{attemptCount}</div>
					<div class="text-sm text-gray-600">Attempted</div>
				</div>
				<div class="bg-orange-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-orange-600">{incorrectCount}</div>
					<div class="text-sm text-gray-600">Incorrect</div>
				</div>
			</div>
		</div>

		<!-- Game Options -->
		{#if !gameStarted}
			<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
				<div class="space-y-4">
					<div class="flex items-center space-x-4">
						<input 
							type="radio" 
							name="gameOptions" 
							value="choose-tricks" 
							bind:group={gameOptions}
							class="w-4 h-4 text-teal-600 focus:ring-teal-500"
						/>
						<span class="text-gray-700">You choose number of tricks to guess</span>
					</div>
					
					<!-- Conditional numeric entry field -->
					{#if gameOptions === 'choose-tricks'}
						<div class="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
							<label class="flex items-center space-x-3">
								<span class="text-gray-700 font-medium">How many tricks between each memory challenge</span>
								<input 
									type="number" 
									bind:value={tricksCount}
									min="1"
									max="13"
									class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center"
								/>
							</label>
						</div>
						
						<div class="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
							<label class="flex items-center space-x-3">
								<span class="text-gray-700 font-medium">Time a trick is displayed (seconds)</span>
								<input 
									type="number" 
									bind:value={trickDisplayTime}
									min="1"
									max="10"
									class="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center"
								/>
							</label>
						</div>
					{/if}
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
						onclick={startGame}
						disabled={trickPhase !== 'setup'}
						class="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
					>
						Start Memory Game
					</button>
					{#if trickPhase === 'memory' || trickPhase === 'guessing'}
						<button 
							onclick={startNextSetOfTricks}
							class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
						>
							Start the next set of tricks
						</button>
					{/if}
					<button 
						onclick={resetGame}
						class="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
					>
						Reset Game
					</button>
				{/if}
			</div>
		</div>

		<!-- Game Instructions (visible before game starts) -->
		{#if !gameStarted}
			<div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
				<h3 class="text-lg font-semibold text-blue-800 mb-2">Game Instructions:</h3>
				<ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
					<li>Configure your game options using the settings below</li>
					<li>Click "Start Memory Game" to begin the trick-based memory challenge</li>
					<li>Watch as tricks are formed automatically with cards from each hand</li>
					<li>After the specified number of tricks, memorize the cards played</li>
					<li>Click cards in "All Possible Cards" to guess the cards from the tricks</li>
					<li>Track your progress with the Found, Remaining, Attempted, and Incorrect counters</li>
				</ol>
			</div>
		{/if}

		<!-- Game Area -->
		{#if gameStarted}
			<div class="space-y-8">
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
									<!-- Initial instruction removed -->
								{/if}
							</div>
						</div>
						<div class="flex space-x-4">
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
						<!-- Four Hands Layout - Fixed positioning -->
						<div class="grid grid-cols-3 gap-6 w-full mx-auto" style="grid-template-rows: auto auto 28.8rem auto;">
							<!-- Top Left - Hand 1 (North) - Back to original position -->
							<div class="col-start-2 row-start-1">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">Dummy</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											<div class="flex flex-wrap gap-1 justify-center">
												{#each ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as rank}
													{@const cardId = `${suit}-${rank}`}
													{@const card = {suit, rank}}
													{@const isInHand = hand1Cards.some(c => c.suit === suit && c.rank === rank)}
													{#if isInHand}
														<Card 
															card={card}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={isCardFlipped(cardId)}
															clickable={gameStarted && !gameCompleted}
															onclick={createCardClickHandler(suit, rank)}
														/>
													{/if}
												{/each}
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Flex container for vertical stacking in Row 3 -->
							<div class="col-start-2 row-start-3 flex flex-col justify-between h-full">
								<!-- Cards for current trick - Top -->
								<div class="flex justify-center">
									<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6 w-full pt-2">
										<h3 class="text-lg font-bold mb-4 text-gray-800 text-center">Cards for current trick</h3>
										<div class="space-y-4 h-20">
											{#if currentTrick.length > 0}
												<div class="flex flex-wrap gap-3 justify-center">
													{#each currentTrick as cardId}
														{@const [suit, rank] = cardId.split('-')}
														{@const card = {suit, rank}}
														<div class="transform scale-110">
															<Card 
																card={card}
																size="medium"
																bridgeTheme={true}
																showBack={false}
																flipped={true}
																clickable={false}
															/>
														</div>
													{/each}
												</div>
											{:else}
												<div class="text-center text-gray-500 text-sm h-20 flex items-center justify-center">
													{#if feedbackMessage}
														<div class="text-lg font-medium {feedbackMessage.includes('Correct') ? 'text-green-600' : 'text-red-600'}">
															{feedbackMessage}
														</div>
													{:else}
														<p>No cards in current trick</p>
													{/if}
												</div>
											{/if}
										</div>	
									</div>
								</div>
								<!-- All Possible Cards - Bottom -->
								<div class="flex justify-center mt-4">
									<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full">
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

							<!-- Left Middle - Hand 2 (West) -->
							<div class="col-start-1 row-start-3">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full">
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
															clickable={false}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Right Middle - Hand 3 (East) -->
							<div class="col-start-3 row-start-3">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full">
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
															clickable={false}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Bottom - Hand 4 (South/Declarer) -->
							<div class="col-start-2 row-start-4">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-4 w-full">
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
															clickable={false}
														/>
													{/each}
												</div>
											{/if}
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
