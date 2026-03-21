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
	});
	
	// Card data
	let handCards = $state<BridgeCard[]>([]);
	let allPossibleCards = $state<BridgeCard[]>([]);
	
	// Organized cards for display (simple reactive state)
	let spadesCards = $state<BridgeCard[]>([]);
	let heartsCards = $state<BridgeCard[]>([]);
	let diamondsCards = $state<BridgeCard[]>([]);
	let clubsCards = $state<BridgeCard[]>([]);

	// Helper function to check if card is flipped
	function isCardFlipped(cardId: string): boolean {
		return flippedCardIds().includes(cardId);
	}
	
	// Handle automatic card flipping
	function startAutoFlipping() {
		if (isAutoFlipping) return;
		
		isAutoFlipping = true;
		console.log('🚀 Starting automatic card flipping');
		console.log(`📋 Flip sequence: ${flipSequence}`);
		
		let currentCardIndex = 0;
		let flipPhase = 'up'; // 'up' or 'down'
		
		// Prepare cards based on sequence choice
		let sortedHandCards: BridgeCard[];
		if (flipSequence === 'ordered') {
			// Ordered sequence: spades -> hearts -> diamonds -> clubs, A -> 2 (high to low)
			sortedHandCards = [...handCards].sort((a, b) => {
				const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
				const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
				const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
				if (suitDiff !== 0) return suitDiff;
				return rankOrder[b.rank] - rankOrder[a.rank]; // Reverse for high to low
			});
		} else {
			// Random sequence
			sortedHandCards = [...handCards].sort(() => Math.random() - 0.5);
		}
		
		console.log('📋 Cards for flipping:', sortedHandCards.map(c => `${c.suit}-${c.rank}`));
		
		autoFlipInterval = setInterval(() => {
			if (currentCardIndex >= sortedHandCards.length) {
				console.log('✅ All cards flipped, stopping automatic flipping');
				stopAutoFlipping();
				return;
			}
			
			const currentCard = sortedHandCards[currentCardIndex];
			const cardId = `${currentCard.suit}-${currentCard.rank}`;
			
			console.log(`🔄 Auto flipping card ${currentCardIndex + 1}/${sortedHandCards.length}: ${cardId} - Phase: ${flipPhase}`);
			console.log(`🔄 Current flipped cards: ${[...handCardFlippedIds].join(', ')}`);
			
			if (flipPhase === 'up') {
				// Flip face up
				handCardFlippedIds = [...handCardFlippedIds, cardId];
				console.log(`🔄 Flipped ${cardId} face up`);
				flipPhase = 'down'; // Next phase will flip down
			} else {
				// Flip back face down
				handCardFlippedIds = handCardFlippedIds.filter(id => id !== cardId);
				console.log(`🔄 Flipped ${cardId} face down`);
				flipPhase = 'up'; // Reset phase for next card
				currentCardIndex++; // Move to next card after flipping down
				
				// Immediately flip next card up if there are more cards
				if (currentCardIndex < sortedHandCards.length) {
					const nextCard = sortedHandCards[currentCardIndex];
					const nextCardId = `${nextCard.suit}-${nextCard.rank}`;
					handCardFlippedIds = [...handCardFlippedIds, nextCardId];
					console.log(`🔄 Immediately flipped next card ${nextCardId} face up`);
					flipPhase = 'down'; // Next interval will flip this card down
				}
			}
			
			console.log(`🔄 New flipped cards: ${[...handCardFlippedIds].join(', ')}`);
			
		}, flipInterval * 1000); // Convert seconds to milliseconds
	}
	
	function stopAutoFlipping() {
		if (autoFlipInterval) {
			clearInterval(autoFlipInterval);
			autoFlipInterval = null;
		}
		isAutoFlipping = false;
		console.log('⏹️ Stopped automatic card flipping');
	}
	
	// Clean up interval on component unmount
	$effect(() => {
		return () => {
			if (autoFlipInterval) {
				clearInterval(autoFlipInterval);
			}
		};
	});
	function isAllPossibleCardFlipped(cardId: string): boolean {
		return allPossibleCardFlippedIds.includes(cardId);
	}

	// Force template reactivity
	$effect(() => {
		console.log('GameStarted changed to:', gameStarted);
	});

	// Debug state changes
	$inspect(gameStarted, (gameStarted) => {
		console.log('🎯 GameStarted state changed to:', gameStarted);
	});

	// Debug handCards changes
	$inspect(handCards, (handCards) => {
		console.log('🃏 HandCards changed to:', handCards.length);
	});

	// Update organized cards when handCards changes
	// REMOVED - causing infinite loop

	// Additional reactivity test
	$effect(() => {
		console.log('Template should update - gameStarted:', gameStarted);
	});

	// Direct test - update template when gameStarted changes
	$effect(() => {
		if (gameStarted) {
			console.log('🎉 GAME STARTED! Template should show game area now!');
		}
	});

	// Initialize cards only when game starts
	onMount(() => {
		console.log('Component mounted - waiting for game to start');
		
		// Always auto-start the game when page loads
		console.log('🚀 Auto-starting game immediately');
		gameStarted = true;
		
		// Add a small delay to ensure template updates
		setTimeout(() => {
			startGame();
		}, 100);
	});
	
	// Start game with selected mode
	function startGame() {
		console.log('🎮 START GAME FUNCTION CALLED!');
		
		// Always set gameStarted to true and initialize game
		gameStarted = true;
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		flippedCardIds = [];
		isProcessing = false;
		currentFlippedCard = null;
		allCardsFlippedOnce = false;
		lastCardFlippedBack = false;
		
		// Generate cards directly here
		const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['spades', 'hearts', 'diamonds', 'clubs'];
		const ranks: ('2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A')[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		
		// Create all possible cards
		allPossibleCards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				allPossibleCards.push({
					suit,
					rank,
					id: `${suit}-${rank}`  // Add id property for duplicate checking
				});
			}
		}
		
		// Generate random hand - EXACTLY like Game 1
		handCards = [];
		const selectedCardIds = new Set<string>();
		
		// Add cards to hand until we have 13 cards
		while (handCards.length < 13) {
			const randomIndex = Math.floor(Math.random() * allPossibleCards.length);
			const selectedCard = allPossibleCards[randomIndex];
			
			// Check if this card is already in hand
			if (!selectedCardIds.has(selectedCard.id)) {
				handCards.push(selectedCard);
				selectedCardIds.add(selectedCard.id);
			}
		}
		
		console.log('✅ All Possible Cards generated - total cards:', allPossibleCards.length);
		console.log('✅ Hand Cards generated - total cards:', handCards.length);
		console.log('✅ All Possible Cards array:', allPossibleCards);
		console.log('✅ Hand Cards array:', handCards);
		console.log('✅ gameStarted state:', gameStarted);
	}
	
	// Sort cards by suit and rank for proper display
	function sortCards(cards: BridgeCard[]) {
		const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
		const rankOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
		
		return cards.sort((a, b) => {
			const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
			if (suitDiff !== 0) return suitDiff;
			return rankOrder[a.rank] - rankOrder[b.rank];
		});
	}
	
	// Start auto-flip for automated mode
	function startAutoFlip() {
		if (autoFlipTimer) {
			clearTimeout(autoFlipTimer);
		}
		
		autoFlipTimer = setTimeout(() => {
			flipNextCard();
		}, 1000);
	}
	
	// Stop auto-flip
	function stopAutoFlip() {
		if (autoFlipTimer) {
			clearTimeout(autoFlipTimer);
			autoFlipTimer = null;
		}
	}
	
	// Flip the next card in automated mode
	function flipNextCard() {
		const unflippedCards = handCards.filter(card => !flippedCardIds.includes(`${card.suit}-${card.rank}`));
		if (unflippedCards.length === 0) {
			isProcessing = false;
			return;
		}
		
		const card = unflippedCards[0];
		const cardId = `${card.suit}-${card.rank}`;
		
		// If there's a current flipped card, flip it back first
		if (currentFlippedCard) {
			flippedCardIds = flippedCardIds.filter(id => id !== currentFlippedCard);
		}
		
		// Flip the new card
		flippedCardIds = [...flippedCardIds, cardId];
		currentFlippedCard = cardId;
		
		// Check if all cards have been flipped at least once
		const flippedUniqueCards = new Set(flippedCardIds);
		if (flippedUniqueCards.size >= handCards.length) {
			allCardsFlippedOnce = true;
		}
		
		// Continue flipping if there are more cards
		if (flippedUniqueCards.size < handCards.length) {
			startAutoFlip();
		} else {
			isProcessing = false;
		}
	}
	
	// Handle card click in manual mode
	function handleCardClick(suit: 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: string) {
		console.log('🎯 CARD CLICK FUNCTION CALLED!');
		if (gameMode !== 'manual') {
			console.log('❌ Not in manual mode, returning');
			return;
		}
		
		const cardId = `${suit}-${rank}`;
		console.log('=== CARD CLICK ===');
		console.log('Card ID:', cardId);
		console.log('Current flipped card:', currentFlippedCard);
		console.log('Flipped card IDs:', [...handCardFlippedIds, ...allPossibleCardFlippedIds]);
		console.log('Game mode:', gameMode);
		
		// Check if clicking on a card in "All Possible Cards"
		const handCardIds = handCards.map(c => `${c.suit}-${c.rank}`);
		const isInHand = handCardIds.includes(cardId);
		console.log('Is in hand:', isInHand);
		console.log('Hand card IDs:', handCardIds);
		
		// This function is only for "Your Hand" cards
		// "All Possible Cards" should use handleAllPossibleCardsClick
		if (!isInHand) {
			console.log('❌ This should not happen - All Possible Cards should use handleAllPossibleCardsClick');
			return;
		}
		
		// Clicking on "Your Hand" cards - Manual mode logic
		console.log('🃏 PROCESSING HAND CARD CLICK');
		
		// Check if card has already been clicked once in manual mode
		const hasBeenClickedOnce = manuallyClickedCards.includes(cardId);
		console.log('Has been clicked once:', hasBeenClickedOnce);
		console.log('Current flipped card:', currentFlippedCard);
		console.log('Card ID being processed:', cardId);
		
		// If clicking the same card that's currently flipped, flip it back (even if already clicked once)
		if (currentFlippedCard === cardId) {
			console.log('Clicking same card - flipping it back');
			currentFlippedCard = null;
			// Remove from handCardFlippedIds to flip it back visually
			handCardFlippedIds = handCardFlippedIds.filter(id => id !== cardId);
			
			// Check if this completes the requirements (all cards clicked and last card face down)
			if (allCardsFlippedOnce && !currentFlippedCard) {
				console.log('✅ All conditions met - all cards clicked and last card face down');
				lastCardFlippedBack = true;
				feedbackMessage = '';
			}
			return;
		}
		
		// If card has already been clicked once and is not currently flipped, prevent clicking
		// BUT allow clicking the current face-up card to flip it back down
		if (hasBeenClickedOnce && currentFlippedCard !== cardId) {
			console.log('❌ Card already clicked once in manual mode and is not current card');
			feedbackMessage = 'This card has already been clicked once in manual mode!';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
			return;
		}
		
		// First time clicking this card in manual mode
		console.log('✅ First time clicking this card in manual mode');
		
		// Add this card to the manually clicked cards tracking
		if (!manuallyClickedCards.includes(cardId)) {
			manuallyClickedCards = [...manuallyClickedCards, cardId];
			console.log('📝 Added card to manual tracking:', cardId);
		}
		
		// If there's a current flipped card, remove it from handCardFlippedIds first
		if (currentFlippedCard) {
			console.log('Removing previous card from flipped state:', currentFlippedCard);
			handCardFlippedIds = handCardFlippedIds.filter(id => id !== currentFlippedCard);
		}
		
		// Flip the new card
		handCardFlippedIds = [...handCardFlippedIds, cardId];
		currentFlippedCard = cardId;
		
		console.log('After click - Current flipped:', currentFlippedCard);
		console.log('After click - Flipped IDs:', [...handCardFlippedIds, ...allPossibleCardFlippedIds]);
		
		// Check if all cards have been clicked once (track all cards that have ever been clicked)
		console.log('🔍 Checking card completion:');
		console.log('  Hand cards length:', handCards.length);
		console.log('  Manually clicked cards:', [...manuallyClickedCards]);
		console.log('  Manually clicked cards size:', manuallyClickedCards.length);
		
		if (manuallyClickedCards.length >= handCards.length) {
			console.log('🎉 All cards have been clicked once!');
			allCardsFlippedOnce = true;
			
			// Check if the last card is currently flipped
			if (currentFlippedCard) {
				console.log('🔄 Last card is currently flipped, waiting for it to be flipped back');
				// Don't set lastCardFlippedBack yet - wait for card to be flipped back
			} else {
				console.log('✅ All cards clicked and last card is face down');
				lastCardFlippedBack = true;
				// Clear any existing feedback message since conditions are met
				feedbackMessage = '';
			}
		}
	}
	
	// Restart game function
	function restartGame() {
		console.log('🔄 RESTARTING GAME');
		console.log('Before restart - gameCompleted:', gameCompleted);
		console.log('Before restart - correctlyMatchedCards length:', correctlyMatchedCards.length);
		console.log('Before restart - handCards length:', handCards.length);
		
		// Keep gameStarted and gameMode true, just reset the game state
		gameCompleted = false;
		handCardFlippedIds = [];
		allPossibleCardFlippedIds = [];
		correctlyMatchedCards = [];
		incorrectCount = 0;
		attemptCount = 0;
		feedbackMessage = '';
		isProcessing = false;
		autoFlipTimer = null;
		currentFlippedCard = null;
		allCardsFlippedOnce = false;
		lastCardFlippedBack = false;
		
		console.log('After state reset - gameCompleted:', gameCompleted);
		console.log('After state reset - correctlyMatchedCards length:', correctlyMatchedCards.length);
		
		// Generate new hand (but don't set gameStarted again)
		// Call the card generation logic directly
		const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['spades', 'hearts', 'diamonds', 'clubs'];
		const ranks: ('2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A')[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		
		// Create all possible cards
		allPossibleCards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				allPossibleCards.push({ suit, rank });
			}
		}
		
		// Create and shuffle deck
		const deck = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				deck.push({ suit, rank });
			}
		}
		
		// Shuffle deck
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}
		
		// Deal 13 cards to hand
		handCards = deck.slice(0, 13);
		
		// Sort both arrays
		const sortCards = (cards: any[]) => {
			return cards.sort((a, b) => {
				const suitOrder = { 'spades': 0, 'hearts': 1, 'diamonds': 2, 'clubs': 3 };
				const rankOrder = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
				
				if (suitOrder[a.suit] !== suitOrder[b.suit]) {
					return suitOrder[a.suit] - suitOrder[b.suit];
				}
				return rankOrder[a.rank] - rankOrder[b.rank];
			});
		};
		
		handCards = sortCards(handCards);
		allPossibleCards = sortCards(allPossibleCards);
		
		console.log('✅ New hand generated for restart - handCards length:', handCards.length);
		console.log('After restart - gameCompleted:', gameCompleted);
		console.log('After restart - correctlyMatchedCards length:', correctlyMatchedCards.length);
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
		
		// Check if this card matches any card in "Your Hand"
		const matchingHandCard = handCards.find(handCard => 
			handCard.suit === suit && handCard.rank === rank
		);
		
		if (matchingHandCard) {
			// Correct choice - card matches one in "Your Hand"
			console.log('✅ Correct choice! Card matches hand card:', matchingHandCard);
			feedbackMessage = 'Correct Choice!';
			setTimeout(() => {
				feedbackMessage = '';
			}, 2000);
			
			// Add to correctly matched cards to keep face up permanently
			correctlyMatchedCards = [...correctlyMatchedCards, cardId];
			
			// Mark this All Possible Cards as clicked (only correct matches get grayed)
			allPossibleCardFlippedIds = [...allPossibleCardFlippedIds, cardId];
			
			// Check if all hand cards have been correctly matched
			console.log('Checking completion - correctlyMatchedCards.length:', correctlyMatchedCards.length);
			console.log('Checking completion - handCards.length:', handCards.length);
			console.log('Checking completion - gameCompleted before check:', gameCompleted);
			
			if (correctlyMatchedCards.length >= handCards.length) {
				console.log('🎉 ALL CARDS MATCHED! Game completed!');
				gameCompleted = true;
				feedbackMessage = 'Congratulations - You Remembered all of the cards in your hand!\nGame Over - Restart to play again.';
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
			
			// Don't gray out incorrect cards - just increment counter
			incorrectCount++;
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
					<span class="text-cyan-600 font-semibold">Game 2</span>
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
				<button 
					onclick={goToTrackCardsPlayed}
					class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span>Track Cards</span>
				</button>
			</div>
		<!-- Header -->
		<header class="bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8">
			<div class="flex justify-between items-center">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
						<span class="text-white font-bold">2</span>
					</div>
					<h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
						Track Cards Played - Game 2
					</h1>
				</div>
				<div class="text-right">
					<div class="text-sm text-gray-500">Score</div>
					<div class="text-lg font-bold text-emerald-600">Level 2</div>
				</div>
			</div>
		</header>

		{#if !gameStarted}
			<!-- Game Setup - Auto-start when page loads -->
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
				<h2 class="text-2xl font-bold mb-6 text-gray-800">Game 2 - Track Cards Played</h2>
				
				<div class="text-center mb-6">
					<p class="text-lg text-gray-700">Loading game...</p>
					<p class="text-sm text-gray-600">Game will start automatically</p>
				</div>
			</div>
		{:else}
			<!-- Game Play Area -->
			<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
				<!-- Debug info only -->
				<div class="text-center mb-4">
					<p class="text-sm text-gray-600">
						Game Started: {gameStarted ? 'YES' : 'NO'}
					</p>
					<p> Button clicks: {buttonClickCount}</p>
				</div>
				
				<!-- Instructions -->
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

					
	
	<!-- Game Stats -->
				<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
					<div class="flex justify-between items-center">
						<div class="text-left">
							<h3 class="text-lg font-semibold text-gray-800">Game Mode: <span class="text-emerald-600">{gameMode === 'manual' ? 'Manual' : 'Automatic'}</span></h3>
							<div class="text-sm text-gray-600 mt-1">
								<div class="flex items-start">
									<button 
										class="px-8 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
										onclick={() => {
											gameMode = 'manual';
											console.log('Manual Mode selected');
										}}
									>
										Manual Card Flipping
									</button>
									<div class="ml-4">
										<button 
											class="px-8 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
											onclick={() => {
												gameMode = 'automated';
												console.log('Automatic Mode selected');
											}}
										>
											Automatic Card Flipping
										</button>
										{#if gameMode === 'automated'}
											<div class="mt-4">
												<label class="flex items-center space-x-3">
													<span class="text-sm font-medium text-gray-700">Time (s) between card flips:</span>
													<input 
														type="number" 
														bind:value={flipInterval}
														min="1" 
														max="10" 
														step="1"
														class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
													/>
												</label>
												<div class="mt-3">
													<label class="flex items-center space-x-3">
														<span class="text-sm font-medium text-gray-700">Flip sequence:</span>
														<select 
															bind:value={flipSequence}
															class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
														>
															<option value="ordered">Ordered (Spades A→2 → Clubs A→2)</option>
															<option value="random">Random</option>
														</select>
													</label>
												</div>
												<div class="mt-3">
													<button 
														class="px-6 py-2 bg-gradient-to-br from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
														onclick={() => startAutoFlipping()}
														disabled={isAutoFlipping}
													>
														{isAutoFlipping ? 'Flipping...' : 'Begin Flipping'}
													</button>
													{#if isAutoFlipping}
														<button 
															class="px-6 py-2 bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ml-2"
															onclick={() => stopAutoFlipping()}
														>
															Stop Flipping
														</button>
													{/if}
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="text-right">
							<div class="flex space-x-4 justify-end">
								<div class="text-2xl font-bold text-red-600">Incorrect: {incorrectCount}</div>
								<div class="text-2xl font-bold text-blue-600">Attempts: {attemptCount}</div>
							</div>
							<div class="h-40 flex items-center justify-center w-full mt-2">
								{#if gameCompleted}
									<div class="text-center">
										<div class="text-lg font-bold text-green-600 mb-3 whitespace-pre-line">
											Congratulations - You Remembered all of the cards in your hand!
										</div>
										<div class="text-lg font-semibold text-blue-600 mb-4">
											Game Over - Restart to play again
										</div>
										<button 
											onclick={restartGame}
											class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
										>
											Restart
										</button>
									</div>
								{:else if feedbackMessage}
									<div class="text-center">
										<div class="text-lg font-semibold {feedbackMessage.includes('revealed') ? 'text-green-600' : feedbackMessage.includes('Correct') ? 'text-green-600' : feedbackMessage.includes('Incorrect') ? 'text-red-600' : 'text-red-600'} whitespace-pre-line px-4">
											{feedbackMessage}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Side-by-side layout for cards -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<!-- Left: Your Hand -->
					<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
						<h3 class="text-xl font-bold mb-6 text-gray-800">Your Hand</h3>
						<div class="space-y-4">
							{#each ['spades', 'hearts', 'diamonds', 'clubs'] as suit}
								{@const suitCards = handCards.filter(card => card.suit === suit)}
								{#if suitCards.length > 0}
									<div class="space-y-2">
										<div class="text-sm font-semibold text-gray-600 mb-1">
											{#if suit === 'spades'}♠ Spades{:else if suit === 'hearts'}♥ Hearts{:else if suit === 'diamonds'}♦ Diamonds{:else if suit === 'clubs'}♣ Clubs{/if}
										</div>
										<div class="flex flex-wrap gap-2">
											{#each suitCards.sort((a, b) => {
												const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
												return rankOrder[b.rank] - rankOrder[a.rank]; // High to low
											}) as card}
												{@const cardId = `${card.suit}-${card.rank}`}
												{@const isFlipped = handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId)}
												<Card 
													card={card}
													size="large"
													bridgeTheme={true}
													showBack={false}
													flipped={isFlipped}
													clickable={true}
													onClick={() => handleCardClick(card.suit, card.rank)}
												/>
											{/each}
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</div>

					<!-- Right: All Possible Cards -->
					<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-100 p-6">
						<h3 class="text-xl font-bold mb-6 text-gray-800">All Possible Cards</h3>
						<div class="space-y-3">
							{#each ['spades', 'hearts', 'diamonds', 'clubs'] as suit}
								<div class="flex flex-wrap gap-2">
									{#each ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as rank}
										{@const cardId = `${suit}-${rank}`}
										{@const isFlipped = isAllPossibleCardFlipped(cardId)}
										{#if !isFlipped}
											<button
												onclick={() => handleAllPossibleCardsClick(suit, rank)}
												class="px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-150 min-w-[3rem] h-[2.5rem] {suit === 'hearts' || suit === 'diamonds' ? 'text-red-600 border-red-300' : 'text-black border-gray-300'} hover:bg-gray-50 hover:shadow-lg"
											>
												{#if suit === 'spades'}♠{:else if suit === 'hearts'}♥{:else if suit === 'diamonds'}♦{:else if suit === 'clubs'}♣{/if}{rank}
											</button>
										{:else}
											<div class="px-3 py-2 text-sm font-semibold rounded-lg border-2 min-w-[3rem] h-[2.5rem] flex items-center justify-center {suit === 'hearts' || suit === 'diamonds' ? 'bg-red-100 border-red-400 text-red-800' : 'bg-gray-100 border-gray-400 text-gray-600'}">
												{#if suit === 'spades'}♠{:else if suit === 'hearts'}♥{:else if suit === 'diamonds'}♦{:else if suit === 'clubs'}♣{/if}{rank}
											</div>
										{/if}
									{/each}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
		{/if}
		</div>
	</div>
		
	<!-- Bottom Left Navigation -->
			</div>

<!-- Bottom Navigation - Part of page flow -->
	<div class="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 mt-8 space-y-2">
		<button 
			class="px-4 py-2 bg-gradient-to-br from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full text-left"
			onclick={() => {
				console.log('Previous - Game Mode clicked');
				goto('/track-cards-played');
			}}
		>
			Previous - Game Mode
		</button>
		<button 
			class="px-4 py-2 bg-gradient-to-br from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full text-left"
			onclick={() => {
				console.log('Return to Game Configuration Menu clicked');
				goto('/track-cards-played');
			}}
		>
			Return to Game Configuration Menu
		</button>
	</div>

<style>
	/* Styles are handled by Tailwind CSS classes */
</style>
