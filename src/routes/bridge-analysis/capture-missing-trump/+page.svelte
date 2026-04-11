<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import type { Card as BridgeCard } from '$lib/types/bridge';
	import type { Card as CardType } from '$lib/types';
	import { calculateHandPoints, calculateDummyPoints, validateDeal } from '$lib/game/points';

	// Game state using Svelte 5 runes
	let gameMode = $state<'manual' | 'automated'>('manual');
	let gameStarted = $state<boolean>(false);
	let gameCompleted = $state<boolean>(false);  // Track if game is completed
	let showOpponentCards = $state<boolean>(false); // New state for showing East/West cards
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
	// Game options state
	let gameOptions = $state('choose-tricks');
	let tricksCount = $state(2);
	let trickDisplayTime = $state(5); // Time a trick is displayed in seconds (default 5)

	// Trick-based gameplay state
	let currentTrick = $state<string[]>([]); // Cards in current trick
	let completedTricks = $state<string[][]>([]); // All completed tricks
	let currentTrickIndex = $state(0); // Index for trick formation
	let trickPhase = $state<'setup' | 'playing' | 'waiting' | 'manual_play' | 'completed' | 'guessing'>('setup'); // Game phase
	let trickTimer = $state<number | null>(null); // Timer for trick display
	let currentSetTricks = $state<string[][]>([]); // Tricks in current memory set
	let tricksInCurrentSet = $state(0); // Count of tricks in current set
	let isWaitingForNextTrick = $state<boolean>(false); // Track if waiting for Next Trick click
	let currentPlayerTurn = $state<'west' | 'dummy' | 'east' | 'declarer'>('west'); // Track whose turn it is
	
	// Bridge play counters
	let opponentsTricks = $state<number>(0); // Counter for tricks won by opponents (West + East)
	let declarerTricks = $state<number>(0); // Counter for tricks won by declarer/dummy partnership
	
	// Hand cards state
	let hand1Cards = $state<CardType[]>([]); // Dummy hand
	let hand2Cards = $state<CardType[]>([]); // West hand  
	let hand3Cards = $state<CardType[]>([]); // East hand
	let hand4Cards = $state<CardType[]>([]); // Declarer hand
	
	// Opponent play level
	let opponentPlayLevel = $state<'beginner' | 'intermediate' | 'advanced'>('beginner');
	
	// BPA-1 Hint System
	let hintsEnabled = $state<boolean>(false);
	let currentHint = $state<string>('');
	let hintDetails = $state<string>('');
	let showHintDetails = $state<boolean>(false);
	let hintProbability = $state<number>(0);
	let hintSuccessRate = $state<string>('');
	let hintPlaySequence = $state<string[]>([]);
	let showPlaySequence = $state<boolean>(false);
	
	// Hint system state tracking
	let hintAnalysis = $state<{
		situation: string;
		options: Array<{
			play: string;
			reasoning: string;
			probability: number;
			successRate: string;
			playSequence: string[];
		}>;
		recommended: number;
	}>({
		situation: '',
		options: [],
		recommended: 0
	});
	
	// Track who played each card in current trick
	let trickCardPlayers = $state<('west' | 'dummy' | 'east' | 'declarer')[]>([]);

	// Navigation functions
	function goToBridgeAnalysis() {
		goto('/bridge-analysis');
	}

	function goToBridgeMemory() {
		goto('/bridge-memory');
	}

	// BPA-1 Hint System Functions
	
	// Toggle hints on/off
	function toggleHints() {
		hintsEnabled = !hintsEnabled;
		console.log('💡 Hints', hintsEnabled ? 'ENABLED' : 'DISABLED');
		
		if (hintsEnabled && gameStarted && !gameCompleted) {
			generateHint();
		} else {
			clearHint();
		}
	}
	
	// Clear current hint
	function clearHint() {
		currentHint = '';
		hintDetails = '';
		showHintDetails = false;
		hintProbability = 0;
		hintSuccessRate = '';
		hintPlaySequence = [];
		showPlaySequence = false;
		hintAnalysis = {
			situation: '',
			options: [],
			recommended: 0
		};
	}
	
	// Generate hint based on current game situation
	function generateHint() {
		if (!gameStarted || gameCompleted || !hintsEnabled) {
			clearHint();
			return;
		}
		
		console.log('🧠 Generating hint for game situation...');
		
		// Analyze current situation and generate appropriate hint
		const analysis = analyzeGameSituation();
		hintAnalysis = analysis;
		
		if (analysis.options.length > 0) {
			const recommendedOption = analysis.options[analysis.recommended];
			currentHint = recommendedOption.play;
			hintDetails = recommendedOption.reasoning;
			hintProbability = recommendedOption.probability;
			hintSuccessRate = recommendedOption.successRate;
			hintPlaySequence = recommendedOption.playSequence;
			
			console.log('💡 Hint generated:', currentHint);
			console.log('📊 Success probability:', hintProbability + '%');
			console.log('🎯 Success rate:', hintSuccessRate);
		} else {
			currentHint = 'No specific hint available for this situation.';
			hintDetails = 'Continue playing according to bridge rules.';
			hintProbability = 0;
			hintSuccessRate = '';
			hintPlaySequence = [];
		}
	}
	
	// Analyze current game situation and generate hint options
	function analyzeGameSituation() {
		const analysis = {
			situation: '',
			options: [] as Array<{
				play: string;
				reasoning: string;
				probability: number;
				successRate: string;
				playSequence: string[];
			}>,
			recommended: 0
		};
		
		// Determine current situation
		if (!gameStarted) {
			analysis.situation = 'Game not started';
			return analysis;
		}
		
		if (gameCompleted) {
			analysis.situation = 'Game completed';
			return analysis;
		}
		
		// Analyze based on game phase
		if (trickPhase === 'waiting') {
			analysis.situation = 'Between tricks - waiting for Next Trick';
			analysis.options = generateBetweenTricksHints();
		} else if (trickPhase === 'playing') {
			if (currentTrick.length === 0) {
				analysis.situation = 'Leading a trick';
				analysis.options = generateLeadHints();
			} else {
				analysis.situation = 'Following suit in trick';
				analysis.options = generateFollowHints();
			}
		} else if (trickPhase === 'manual_play') {
			analysis.situation = 'Manual card selection required';
			analysis.options = generateManualPlayHints();
		}
		
		// Set recommended option (highest probability)
		if (analysis.options.length > 0) {
			analysis.recommended = 0; // First option is recommended
		}
		
		return analysis;
	}
	
	// Generate hints for leading a trick
	function generateLeadHints() {
		const hints = [];
		const playerHand = currentPlayerTurn === 'declarer' ? hand4Cards : 
		                  currentPlayerTurn === 'dummy' ? hand1Cards : 
		                  currentPlayerTurn === 'west' ? hand2Cards : hand3Cards;
		
		// Analyze hand composition
		const suitAnalysis = analyzeHandSuits(playerHand);
		const totalTricks = declarerTricks + opponentsTricks;
		
		// Generate lead options based on hand analysis
		for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as const) {
			const suitInfo = suitAnalysis[suit];
			if (suitInfo.count > 0 && suit !== 'hearts') { // Don't lead hearts unless very strong
				const probability = calculateLeadSuccessProbability(suitInfo, totalTricks);
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateLeadPlaySequence(suit, suitInfo);
				
				hints.push({
					play: 'Lead ' + getCardDescription({...suitInfo.highest, id: suitInfo.highest.suit + '-' + suitInfo.highest.rank}) + ' from ' + suit,
					reasoning: 'Strong ' + suit + ' suit with ' + suitInfo.count + ' cards and ' + suitInfo.honorCount + ' honors. ' + getLeadReasoning(suitInfo),
					probability: probability,
					successRate: successRate,
					playSequence: playSequence
				});
			}
		}
		
		// Sort by probability (highest first)
		hints.sort((a, b) => b.probability - a.probability);
		
		return hints.slice(0, 3); // Return top 3 options
	}
	
	// Generate hints for following suit
	function generateFollowHints() {
		const hints = [];
		const leadSuit = getLeadSuit();
		
		if (!leadSuit) {
			return hints;
		}
		
		const playerHand = currentPlayerTurn === 'declarer' ? hand4Cards : 
		                  currentPlayerTurn === 'dummy' ? hand1Cards : 
		                  currentPlayerTurn === 'west' ? hand2Cards : hand3Cards;
		
		const suitCards = getCardsInSuit(playerHand, leadSuit);
		
		if (suitCards.length > 0) {
			// Must follow suit - generate options for which card to play
			for (const card of suitCards) {
				const probability = calculateFollowSuccessProbability({...card, id: card.suit + '-' + card.rank}, leadSuit);
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateFollowPlaySequence({...card, id: card.suit + '-' + card.rank}, leadSuit);
				
				hints.push({
					play: 'Play ' + getCardDescription({...card, id: card.suit + '-' + card.rank}) + ' from ' + leadSuit,
					reasoning: getFollowReasoning({...card, id: card.suit + '-' + card.rank}, leadSuit, suitCards.map(c => ({...c, id: c.suit + '-' + c.rank}))),
					probability: probability,
					successRate: successRate,
					playSequence: playSequence
				});
			}
		} else {
			// Can't follow suit - can play any card including trump
			const trumpCards = getCardsInSuit(playerHand, 'hearts');
			
			if (trumpCards.length > 0) {
				// Trump options
				for (const trumpCard of trumpCards) {
					const probability = calculateTrumpSuccessProbability({...trumpCard, id: trumpCard.suit + '-' + trumpCard.rank});
					const successRate = getSuccessRateDescription(probability);
					const playSequence = generateTrumpPlaySequence({...trumpCard, id: trumpCard.suit + '-' + trumpCard.rank});
					
					hints.push({
						play: 'Play trump ' + getCardDescription({...trumpCard, id: trumpCard.suit + '-' + trumpCard.rank}),
						reasoning: getTrumpReasoning({...trumpCard, id: trumpCard.suit + '-' + trumpCard.rank}, trumpCards.map(c => ({...c, id: c.suit + '-' + c.rank}))),
						probability: probability,
						successRate: successRate,
						playSequence: playSequence
					});
				}
			}
			
			// Non-trump discard options
			const nonTrumpCards = playerHand.filter(card => card.suit !== 'hearts');
			for (const discardCard of nonTrumpCards.slice(0, 2)) { // Top 2 discard options
				const probability = calculateDiscardSuccessProbability({...discardCard, id: discardCard.suit + '-' + discardCard.rank});
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateDiscardPlaySequence({...discardCard, id: discardCard.suit + '-' + discardCard.rank});
				
				hints.push({
					play: 'Discard ' + getCardDescription({...discardCard, id: discardCard.suit + '-' + discardCard.rank}),
					reasoning: getDiscardReasoning({...discardCard, id: discardCard.suit + '-' + discardCard.rank}, nonTrumpCards.map(c => ({...c, id: c.suit + '-' + c.rank}))),
					probability: probability,
					successRate: successRate,
					playSequence: playSequence
				});
			}
		}
		
		// Sort by probability and return top options
		hints.sort((a, b) => b.probability - a.probability);
		return hints.slice(0, 3);
	}
	
	// Generate hints for manual play (Declarer/Dummy)
	function generateManualPlayHints() {
		const hints = [];
		const playerHand = currentPlayerTurn === 'declarer' ? hand4Cards : hand1Cards;
		
		// Use same logic as follow hints since manual play occurs during trick
		return generateFollowHints();
	}
	
	// Generate hints between tricks
	function generateBetweenTricksHints() {
		const hints = [];
		const totalTricks = declarerTricks + opponentsTricks;
		const tricksNeeded = 10 - declarerTricks;
		const tricksRemaining = 13 - totalTricks;
		
		if (tricksNeeded > 0 && tricksRemaining >= tricksNeeded) {
			const probability = Math.min(95, (declarerTricks / 10) * 100);
			const successRate = getSuccessRateDescription(probability);
			const playSequence = generateEndgameSequence();
			
			hints.push({
				play: 'Focus on making contract',
				reasoning: 'Need ' + tricksNeeded + ' more tricks from ' + tricksRemaining + ' remaining. Current progress: ' + declarerTricks + '/10 tricks.',
				probability: probability,
				successRate: successRate,
				playSequence: playSequence
			});
		} else if (declarerTricks >= 10) {
			hints.push({
				play: 'Play for overtricks',
				reasoning: 'Contract already made (' + declarerTricks + ' tricks). Focus on maximizing tricks.',
				probability: 85,
				successRate: 'High',
				playSequence: generateOvertrickSequence()
			});
		}
		
		return hints;
	}

	function goToMain() {
		goto('/');
	}

	function resetGame() {
		console.log('Resetting game');
		gameStarted = false;
		gameCompleted = false;
		trickPhase = 'setup';
		currentPlayerTurn = 'west';
		
		// Reset all game state
		currentTrick = [];
		trickCardPlayers = [];
		completedTricks = [];
		currentTrickIndex = 0;
		opponentsTricks = 0;
		declarerTricks = 0;
		
		// Reset card states
		handCardFlippedIds = [];
		allPossibleCardFlippedIds = [];
		correctlyMatchedCards = [];
		feedbackMessage = '';
		incorrectCount = 0;
		attemptCount = 0;
		
		// Reinitialize cards
		initializeCards();
	}

	// Game control functions
	function startGame() {
		console.log('Starting Bridge Play Analysis game');
		gameStarted = true;
		gameCompleted = false;
		trickPhase = 'playing';
		currentPlayerTurn = 'west';
		
		// Start with West opponent playing first card
		playWestCard();
	}

	function handleNextTrick() {
		console.log('Next Trick button clicked');
		if (!isWaitingForNextTrick) {
			console.log('Not waiting for next trick');
			return;
		}
		
		// Clear current trick and start new one
		currentTrick = [];
		trickCardPlayers = [];
		isWaitingForNextTrick = false;
		trickPhase = 'playing';
		
		// Winner of previous trick leads next trick
		advanceToNextPlayer();
	}

	// Bridge gameplay helper functions
	
	// Get the lead suit from current trick
	function getLeadSuit(): string | null {
		if (currentTrick.length === 0) return null;
		const firstCardId = currentTrick[0];
		const [suit] = firstCardId.split('-');
		return suit;
	}
	
	// Get cards in a specific suit from a hand
	function getCardsInSuit(hand: CardType[], suit: string): CardType[] {
		return hand.filter(card => card.suit === suit);
	}
	
	// Generate follow play sequence
	function generateFollowPlaySequence(card: CardType, leadSuit: string): string[] {
		const sequence = [];
		sequence.push('Play ' + getCardDescription(card) + ' to follow suit');
		sequence.push('Observe partner\'s card if applicable');
		sequence.push('Plan next trick based on outcome');
		return sequence;
	}
	
	// Generate trump play sequence  
	function generateTrumpPlaySequence(trumpCard: CardType): string[] {
		const sequence = [];
		sequence.push('Play trump ' + getCardDescription(trumpCard));
		sequence.push('Draw opponent trumps if possible');
		sequence.push('Use remaining trumps to control play');
		return sequence;
	}
	
	// Generate discard play sequence
	function generateDiscardPlaySequence(discardCard: CardType): string[] {
		const sequence = [];
		sequence.push('Discard ' + getCardDescription(discardCard));
		sequence.push('Preserve high cards in other suits');
		sequence.push('Signal strength to partner if applicable');
		return sequence;
	}
	
	// Generate endgame sequence
	function generateEndgameSequence(): string[] {
		const sequence = [];
		const tricksNeeded = 10 - declarerTricks;
		sequence.push('Focus on making ' + tricksNeeded + ' more tricks');
		sequence.push('Cash established winners first');
		sequence.push('Use trump to control remaining tricks');
		sequence.push('Preserve entries to both hands');
		return sequence;
	}
	
	// Generate overtrick sequence
	function generateOvertrickSequence(): string[] {
		const sequence = [];
		sequence.push('Contract secured - play for maximum tricks');
		sequence.push('Test opponent distributions');
		sequence.push('Set up finesses for extra tricks');
		sequence.push('Use trump efficiently for overtricks');
		return sequence;
	}
	
	// West opponent plays a card (automatic)
	function playWestCard() {
		console.log('West opponent playing card');
		currentPlayerTurn = 'west';
		
		if (hand2Cards.length === 0) {
			console.log('West has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Play a card following bridge rules
		const selectedCard = playCardFollowingSuit(hand2Cards, 'West');
		
		if (!selectedCard) {
			console.log('No card selected for West');
			advanceToNextPlayer();
			return;
		}
		
		const cardId = selectedCard.suit + '-' + selectedCard.rank;
		
		// Add to current trick and track player
		currentTrick.push(cardId);
		trickCardPlayers.push('west');
		
		// Remove from West's hand
		hand2Cards = hand2Cards.filter(card => !(card.suit === selectedCard.suit && card.rank === selectedCard.rank));
		
		console.log('West played:', cardId);
		
		// Advance to next player
		advanceToNextPlayer();
	}
	
	// Play a card following suit rules
	function playCardFollowingSuit(hand: CardType[], player: string): CardType | null {
		const leadSuit = getLeadSuit();
		
		if (leadSuit) {
			// Must follow suit if possible
			const suitCards = getCardsInSuit(hand, leadSuit);
			if (suitCards.length > 0) {
				// Play highest card of the suit
				return suitCards[0];
			}
		}
		
		// Can play any card - play lowest card
		const sortedHand = [...hand].sort((a, b) => {
			const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
			return rankOrder[a.rank] - rankOrder[b.rank];
		});
		
		return sortedHand[0] || null;
	}
	
	// Advance to next player in turn
	function advanceToNextPlayer() {
		console.log('Advancing to next player from:', currentPlayerTurn);
		
		if (currentTrick.length >= 4) {
			// Trick is complete - determine winner and update counters
			const winner = determineTrickWinner();
			console.log('Trick winner:', winner);
			
			// Update appropriate counter
			if (winner === 'declarer' || winner === 'dummy') {
				declarerTricks++;
			} else {
				opponentsTricks++;
			}
			
			// Set next trick leader to the winner
			currentPlayerTurn = winner;
			console.log('Next trick leader:', currentPlayerTurn);
			
			// Store completed trick for display
			completedTricks = [...completedTricks, currentTrick];
			
			trickPhase = 'waiting';
			isWaitingForNextTrick = true;
			feedbackMessage = 'Trick complete! Click "Next Trick" to continue';
			setTimeout(() => {
				feedbackMessage = '';
			}, 3000);
			
			return;
		}
		
		// Determine next player
		switch (currentPlayerTurn) {
			case 'west':
				currentPlayerTurn = 'dummy';
				console.log('Next player: Dummy (manual play required)');
				trickPhase = 'manual_play';
				feedbackMessage = 'Click a card in Dummy hand to play';
				break;
			case 'dummy':
				currentPlayerTurn = 'east';
				console.log('Next player: East (automatic play)');
				playEastCard();
				break;
			case 'east':
				currentPlayerTurn = 'declarer';
				console.log('Next player: Declarer (manual play required)');
				trickPhase = 'manual_play';
				feedbackMessage = 'Click a card in Declarer hand to play';
				break;
			case 'declarer':
				currentPlayerTurn = 'west';
				console.log('Next player: West (automatic play)');
				playWestCard();
				break;
		}
	}
	
	// East opponent plays a card (automatic)
	function playEastCard() {
		console.log('East opponent playing card');
		currentPlayerTurn = 'east';
		
		if (hand3Cards.length === 0) {
			console.log('East has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Play a card following bridge rules
		const selectedCard = playCardFollowingSuit(hand3Cards, 'East');
		
		if (!selectedCard) {
			console.log('No card selected for East');
			advanceToNextPlayer();
			return;
		}
		
		const cardId = selectedCard.suit + '-' + selectedCard.rank;
		
		// Add to current trick and track player
		currentTrick.push(cardId);
		trickCardPlayers.push('east');
		
		// Remove from East's hand
		hand3Cards = hand3Cards.filter(card => !(card.suit === selectedCard.suit && card.rank === selectedCard.rank));
		
		console.log('East played:', cardId);
		
		// Advance to next player
		advanceToNextPlayer();
	}
	
	// Determine trick winner
	function determineTrickWinner(): 'west' | 'dummy' | 'east' | 'declarer' {
		if (currentTrick.length === 0) return 'west';
		
		const leadSuit = getLeadSuit();
		if (!leadSuit) return 'west';
		
		let winningPlayer = currentPlayerTurn;
		let winningCard = currentTrick[0];
		
		// Check each card in the trick
		for (let i = 1; i < currentTrick.length; i++) {
			const cardId = currentTrick[i];
			const player = trickCardPlayers[i];
			const [suit, rank] = cardId.split('-');
			
			// Trump beats everything
			if (suit === 'hearts' && winningCard.split('-')[0] !== 'hearts') {
				winningCard = cardId;
				winningPlayer = player;
			}
			// Higher card of lead suit beats lower card
			else if (suit === winningCard.split('-')[0]) {
				const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
				if (rankOrder[rank] > rankOrder[winningCard.split('-')[1]]) {
					winningCard = cardId;
					winningPlayer = player;
				}
			}
		}
		
		return winningPlayer;
	}
	
	// Parse card ID into suit and rank
	function parseCardId(cardId: string): CardType | null {
		const parts = cardId.split('-');
		if (parts.length !== 2) return null;
		
		const [suit, rank] = parts;
		return {
			suit: suit as 'hearts' | 'diamonds' | 'clubs' | 'spades',
			rank: rank as '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A',
			id: cardId
		};
	}
	
	// Update hints if enabled
	function updateHintsIfEnabled() {
		if (hintsEnabled) {
			const hints = generateHints();
			if (hints.length > 0) {
				currentHint = hints[0].play;
				hintDetails = hints[0].reasoning;
				hintProbability = hints[0].probability;
				hintSuccessRate = hints[0].successRate;
				hintPlaySequence = hints[0].playSequence;
			}
		}
	}
	
	// Initialize cards for bridge game
	function initializeCards() {
		// Create a standard deck of cards
		const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
		const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
		
		const deck: CardType[] = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				deck.push({
					suit,
					rank,
					id: suit + '-' + rank
				});
			}
		}
		
		// Shuffle and deal cards to 4 hands
		const shuffled = [...deck].sort(() => Math.random() - 0.5);
		hand1Cards = shuffled.slice(0, 13); // Dummy
		hand2Cards = shuffled.slice(13, 26); // West
		hand3Cards = shuffled.slice(26, 39); // East
		hand4Cards = shuffled.slice(39, 52); // Declarer
		
		console.log('Cards dealt to 4 hands');
	}
	
	// Check if card match is correct
	function checkIsCorrectMatch(cardId: string): boolean {
		// For bridge analysis, any card in the current trick is considered a correct match
		return currentTrick.includes(cardId);
	}
	
	// Return to setup phase
	function returnToSetupPhase() {
		console.log('Returning to setup phase');
		trickPhase = 'setup';
		currentTrick = [];
		trickCardPlayers = [];
		feedbackMessage = 'Ready for new trick';
	}
	
	// Get border class for current player
	function getCurrentPlayerBorderClass(player: string): string {
		if (player === currentPlayerTurn) {
			return 'border-4 border-blue-500 shadow-blue-500/50 shadow-lg';
		}
		return 'border border-gray-300';
	}
	
	// Handle manual card click for bridge play
	function handleManualCardClick(suit: string, rank: string, hand: 'dummy' | 'declarer') {
		console.log('Manual card click: ' + suit + '-' + rank + ' from ' + hand);
		
		// Check if it's the correct player's turn
		if (hand === 'dummy' && currentPlayerTurn !== 'dummy') {
			console.log('Not Dummy\'s turn');
			return;
		}
		if (hand === 'declarer' && currentPlayerTurn !== 'declarer') {
			console.log('Not Declarer\'s turn');
			return;
		}
		
		const cardId = suit + '-' + rank;
		
		// Check if player must follow suit
		const leadSuit = getLeadSuit();
		if (leadSuit) {
			// Get the player's hand
			const playerHand = hand === 'dummy' ? hand1Cards : hand4Cards;
			
			// Check if player has cards in the lead suit
			const suitCards = getCardsInSuit(playerHand, leadSuit);
			if (suitCards.length > 0 && suit !== leadSuit) {
				console.log('Must follow suit! Play ' + leadSuit + ' card.');
				feedbackMessage = 'You must follow suit! Play a ' + leadSuit + ' card.';
				setTimeout(() => {
					feedbackMessage = '';
				}, 3000);
				return;
			}
		}
		
		// Add card to current trick
		currentTrick.push(cardId);
		trickCardPlayers.push(hand);
		
		// Remove card from hand
		if (hand === 'dummy') {
			hand1Cards = hand1Cards.filter(card => !(card.suit === suit && card.rank === rank));
		} else {
			hand4Cards = hand4Cards.filter(card => !(card.suit === suit && card.rank === rank));
		}
		
		console.log('Card played:', cardId);
		
		// Advance to next player
		advanceToNextPlayer();
	}
	
	// Check if card is flipped
	function isCardFlipped(cardId: string): boolean {
		return handCardFlippedIds.includes(cardId) || correctlyMatchedCards.includes(cardId);
	}

	// Generate hints for current game state
	function generateHints() {
		const hints = [];
		
		// Generate hints based on current game state
		if (trickPhase === 'manual_play') {
			const playerHand = currentPlayerTurn === 'declarer' ? hand4Cards : 
			                  currentPlayerTurn === 'dummy' ? hand1Cards : 
			                  currentPlayerTurn === 'west' ? hand2Cards : hand3Cards;
			
			const leadSuit = getLeadSuit();
			if (leadSuit) {
				// Must follow suit
				const suitCards = getCardsInSuit(playerHand, leadSuit);
				if (suitCards.length > 0) {
					for (const card of suitCards.slice(0, 2)) {
						hints.push({
							play: 'Play ' + getCardDescription(card),
							reasoning: 'Must follow suit with ' + leadSuit,
							probability: 75,
							successRate: 'Medium',
							playSequence: generateFollowPlaySequence(card, leadSuit)
						});
					}
				} else {
					// Can play any card
					const trumpCards = getCardsInSuit(playerHand, 'hearts');
					if (trumpCards.length > 0) {
						hints.push({
							play: 'Play trump ' + getCardDescription(trumpCards[0]),
							reasoning: 'Cannot follow suit, can play trump',
							probability: 85,
							successRate: 'High',
							playSequence: generateTrumpPlaySequence(trumpCards[0])
						});
					}
				}
			} else {
				// Leading - suggest highest cards
				for (const suit of ['spades', 'diamonds', 'clubs'] as const) {
					const suitCards = getCardsInSuit(playerHand, suit);
					if (suitCards.length > 0) {
						hints.push({
							play: 'Lead ' + getCardDescription(suitCards[0]),
							reasoning: 'Good lead from ' + suit,
							probability: 70,
							successRate: 'Medium',
							playSequence: generateLeadPlaySequence(suit, { highest: suitCards[0], count: suitCards.length, honorCount: 0 })
						});
					}
				}
			}
		}
		
		return hints;
	}

	// BPA-1 Hint System Helper Functions
	
	// Analyze hand suits for leading decisions
	function analyzeHandSuits(hand: CardType[]) {
		const analysis: Record<string, {
			count: number;
			honorCount: number;
			highest: CardType;
			lowest: CardType;
			sequence: CardType[];
		}> = {};
		
		for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as const) {
			const suitCards = getCardsInSuit(hand, suit).sort((a, b) => {
				const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
				return rankOrder[b.rank] - rankOrder[a.rank];
			});
			
			const honors = suitCards.filter(card => ['A', 'K', 'Q', 'J', '10'].includes(card.rank));
			const sequence = findSequences(suitCards.map(card => ({...card, id: card.suit + '-' + card.rank})));
			
			analysis[suit] = {
				count: suitCards.length,
				honorCount: honors.length,
				highest: suitCards[0] ? {...suitCards[0], id: suitCards[0].suit + '-' + suitCards[0].rank} : null,
				lowest: suitCards[suitCards.length - 1] ? {...suitCards[suitCards.length - 1], id: suitCards[suitCards.length - 1].suit + '-' + suitCards[suitCards.length - 1].rank} : null,
				sequence: sequence
			};
		}
		
		return analysis;
	}
	
	// Find sequences in suit
	function findSequences(cards: CardType[]): CardType[] {
		if (cards.length < 2) return [];
		
		const sequences = [];
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		
		for (let i = 0; i < cards.length - 1; i++) {
			const currentRank = rankOrder[cards[i].rank];
			const nextRank = rankOrder[cards[i + 1].rank];
			
			if (currentRank === nextRank + 1) {
				sequences.push(cards[i]);
				if (i + 2 < cards.length && rankOrder[cards[i + 2].rank] === nextRank - 1) {
					sequences.push(cards[i + 1]);
					if (i + 3 < cards.length && rankOrder[cards[i + 3].rank] === nextRank - 2) {
						sequences.push(cards[i + 2]);
					}
				}
			}
		}
		
		return sequences;
	}
	
	// Calculate lead success probability
	function calculateLeadSuccessProbability(suitInfo: any, totalTricks: number): number {
		let probability = 50; // Base probability
		
		// Adjust for suit length
		if (suitInfo.count >= 5) probability += 20;
		else if (suitInfo.count >= 4) probability += 15;
		else if (suitInfo.count >= 3) probability += 10;
		
		// Adjust for honors
		if (suitInfo.honorCount >= 3) probability += 15;
		else if (suitInfo.honorCount >= 2) probability += 10;
		else if (suitInfo.honorCount >= 1) probability += 5;
		
		// Adjust for sequences
		if (suitInfo.sequence.length >= 3) probability += 10;
		else if (suitInfo.sequence.length >= 2) probability += 5;
		
		// Adjust for game stage
		if (totalTricks < 5) probability += 5; // Early game
		else if (totalTricks > 8) probability -= 5; // Late game
		
		// Avoid leading hearts penalty
		if (suitInfo.suit === 'hearts' && suitInfo.count < 6) probability -= 20;
		
		return Math.max(10, Math.min(95, probability));
	}
	
	// Calculate follow suit success probability
	function calculateFollowSuccessProbability(card: CardType, leadSuit: string): number {
		let probability = 50; // Base probability
		
		// Adjust for card rank
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[card.rank];
		
		if (cardRank >= 13) probability += 20; // Ace/King
		else if (cardRank >= 12) probability += 15; // Queen
		else if (cardRank >= 11) probability += 10; // Jack
		else if (cardRank >= 10) probability += 5; // Ten
		
		// Adjust for current trick state
		const currentTrickCards = currentTrick.map(id => parseCardId(id)).filter(Boolean);
		const highestInTrick = Math.max(...currentTrickCards.map(c => rankOrder[c.rank]));
		
		if (cardRank > highestInTrick) probability += 15; // Can win trick
		else if (cardRank === highestInTrick) probability += 5; // Tie
		
		// Adjust for position in trick
		const position = currentTrick.length;
		if (position === 3) probability += 10; // Last to play
		else if (position === 2) probability += 5; // Third to play
		
		return Math.max(10, Math.min(95, probability));
	}
	
	// Calculate trump success probability
	function calculateTrumpSuccessProbability(trumpCard: CardType): number {
		let probability = 60; // Base probability for trump
		
		// Adjust for trump rank
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[trumpCard.rank];
		
		if (cardRank >= 13) probability += 15; // Ace/King of trump
		else if (cardRank >= 12) probability += 10; // Queen of trump
		else if (cardRank >= 11) probability += 5; // Jack of trump
		
		// Check if trump can win current trick
		const currentTrickCards = currentTrick.map(id => parseCardId(id)).filter(Boolean);
		const nonTrumpCards = currentTrickCards.filter(c => c.suit !== 'hearts');
		
		if (nonTrumpCards.length > 0) {
			probability += 20; // Trump beats non-trump
		}
		
		// Check for higher trumps already played
		const higherTrumpsPlayed = currentTrickCards.filter(c => 
			c.suit === 'hearts' && rankOrder[c.rank] > cardRank
		);
		
		if (higherTrumpsPlayed.length > 0) {
			probability -= 15; // Higher trump already played
		}
		
		return Math.max(10, Math.min(95, probability));
	}
	
	// Calculate discard success probability
	function calculateDiscardSuccessProbability(discardCard: CardType): number {
		let probability = 40; // Base probability for discard
		
		// Prefer discarding low cards
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[discardCard.rank];
		
		if (cardRank <= 5) probability += 15; // Very low card
		else if (cardRank <= 8) probability += 10; // Low card
		else if (cardRank <= 10) probability += 5; // Medium card
		else probability -= 10; // High card
		
		// Prefer discarding from long suits
		const playerHand = currentPlayerTurn === 'declarer' ? hand4Cards : 
		                  currentPlayerTurn === 'dummy' ? hand1Cards : 
		                  currentPlayerTurn === 'west' ? hand2Cards : hand3Cards;
		const suitLength = getCardsInSuit(playerHand, discardCard.suit).length;
		
		if (suitLength >= 5) probability += 10; // Long suit
		else if (suitLength <= 2) probability -= 10; // Short suit
		
		return Math.max(10, Math.min(85, probability));
	}
	
	// Get success rate description
	function getSuccessRateDescription(probability: number): string {
		if (probability >= 80) return 'Very High';
		if (probability >= 65) return 'High';
		if (probability >= 50) return 'Medium';
		if (probability >= 35) return 'Low';
		return 'Very Low';
	}
	
	// Get card description
	function getCardDescription(card: CardType): string {
		if (!card) return 'Unknown';
		return card.rank + ' of ' + card.suit;
	}
	
	// Get lead reasoning
	function getLeadReasoning(suitInfo: any): string {
		if (suitInfo.sequence.length >= 2) {
			return 'Lead top of sequence to establish suit.';
		}
		if (suitInfo.count >= 5) {
			return 'Long suit - lead to establish length.';
		}
		if (suitInfo.honorCount >= 2) {
			return 'Strong suit with honors - good lead potential.';
		}
		return 'Safe lead from 4th highest card.';
	}
	
	// Get follow reasoning
	function getFollowReasoning(card: CardType, leadSuit: string, suitCards: CardType[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[card.rank];
		const isHighest = cardRank === Math.max(...suitCards.map(c => rankOrder[c.rank]));
		
		if (isHighest && cardRank >= 12) {
			return 'Play high honor to potentially win trick.';
		}
		if (cardRank <= 5) {
			return 'Play low card - conserve high cards for later.';
		}
		if (suitCards.length === 2) {
			return 'Second card - play appropriately based on partnership.';
		}
		return 'Standard follow suit play.';
	}
	
	// Get trump reasoning
	function getTrumpReasoning(trumpCard: CardType, trumpCards: CardType[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[trumpCard.rank];
		const isHighest = cardRank === Math.max(...trumpCards.map(c => rankOrder[c.rank]));
		
		if (isHighest) {
			return 'Play highest trump to win trick.';
		}
		if (trumpCards.length > 3) {
			return 'Plenty of trumps - can afford to play this one.';
		}
		return 'Conserve trumps - play low trump.';
	}
	
	// Get discard reasoning
	function getDiscardReasoning(discardCard: CardType, nonTrumpCards: CardType[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[discardCard.rank];
		
		if (cardRank <= 3) {
			return 'Discard lowest card - no value.';
		}
		if (cardRank <= 8) {
			return 'Discard low card - minimal value.';
		}
		return 'Discard from longest suit to preserve short suits.';
	}
	
	// Generate play sequences
	function generateLeadPlaySequence(suit: string, suitInfo: any): string[] {
		const sequence = [];
		sequence.push('Lead ' + getCardDescription(suitInfo.highest) + ' from ' + suit);
		sequence.push('Watch opponent responses to gauge strength');
		sequence.push('Plan to establish suit with subsequent leads');
		return sequence;
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
		// CRITICAL: Check if deal is valid before starting gameplay
		const declarerPoints = calculateHandPoints(hand4Cards);
		const dummyPoints = calculateDummyPoints(hand1Cards);
		const totalPoints = declarerPoints + dummyPoints;
		const validation = validateDeal(hand4Cards, hand1Cards);
		
		if (!validation.isValid) {
			console.log('🚫 CRITICAL: Invalid deal detected - NOT starting gameplay');
			console.log('   Issues:', validation.errors.join(', '));
			console.log('   Please wait for a valid deal...');
			return; // Don't start gameplay with invalid deal
		}
		
		console.log('🃏 Starting trick formation');
		currentTrick = [];
		currentTrickIndex = 0;
		trickPhase = 'playing';
		// DISABLED: Old memory game logic that interferes with bridge gameplay
		// selectNextCardForTrick();
		console.log('🚫 Memory game logic disabled - using bridge gameplay instead');
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
			!isCardInCompletedTricks(card.suit + '-' + card.rank)
		);

		if (availableCards.length === 0) {
			// No cards left in this hand, skip to next
			currentTrickIndex++;
			selectNextCardForTrick();
			return;
		}

		// Select a random card from available cards
		const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
		const cardId = randomCard.suit + '-' + randomCard.rank;
		
		currentTrick.push(cardId);
		removeCardFromHand(randomCard.suit, randomCard.rank);
		
		currentTrickIndex++;
		selectNextCardForTrick();
	}

	function removeCardFromHand(suit: string, rank: string) {
		console.log('🗑️ Removing ' + suit + '-' + rank + ' from hand');
		
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
		console.log('� DISABLED: Old memory game logic - displayCurrentTrick() called but disabled');
		console.log('🚫 This function was interfering with bridge gameplay by clearing currentTrick');
		
		// DISABLED: Old memory game logic that interferes with bridge gameplay
		// Add to completed tricks
		// completedTricks.push([...currentTrick]);
		// currentSetTricks.push([...currentTrick]);
		// tricksInCurrentSet++;
		
		// DISABLED: Timer that was clearing currentTrick and interfering with bridge gameplay
		// trickTimer = setTimeout(() => {
		//     console.log('🗑️ Removing current trick after display time');
		//     currentTrick = []; // THIS WAS THE PROBLEM!
		//     ...
		// }, trickDisplayTime * 1000);
	}

	function checkTrickGuess(suit: string, rank: string) {
		console.log('🎯 Checking trick guess:', suit + '-' + rank);
		
		const cardId = suit + '-' + rank;
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

		const cardId = suit + '-' + rank;
		console.log('🎴 Card clicked: ' + cardId);
		
		// Check if card is already correctly matched
		if (correctlyMatchedCards.includes(cardId)) {
			console.log('🎴 Card already correctly matched, ignoring click');
			return;
		}

		// Check if card is already flipped
		if (flippedCardIds().includes(cardId)) {
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
		const isCorrectMatch = checkIsCorrectMatch(cardId);
		
		if (isCorrectMatch) {
			// Add to correctly matched cards
			correctlyMatchedCards = [...correctlyMatchedCards, cardId];
			feedbackMessage = 'Correct! Card stays face up.';
			
			// Check if game is completed (all 52 cards found)
			if (correctlyMatchedCards.length === 52) {
				gameCompleted = true;
				feedbackMessage = '🎉 Congratulations! You found all 52 cards in ' + attemptCount + ' attempts!';
				returnToSetupPhase(); // Return to setup phase for new deal
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

	// Create a card click handler for Dummy and Declarer
	function createCardClickHandler(suit: string, rank: string, hand: 'dummy' | 'declarer') {
		return () => {
			handleManualCardClick(suit, rank, hand);
		};
	}

	// Initialize game on mount
	onMount(() => {
		console.log('🚀 Game 3 component mounted');
		
		// Generate cards with retry logic for valid deals
		let attempts = 0;
		const maxAttempts = 50;
		
		while (attempts < maxAttempts) {
			attempts++;
			console.log('🔄 Mount: Generating deal attempt ' + attempts + '/' + maxAttempts);
			
			initializeCards();
			
			// Validate the generated deal
			const declarerPoints = calculateHandPoints(hand4Cards);
			const dummyPoints = calculateDummyPoints(hand1Cards);
			const validation = validateDeal(hand4Cards, hand1Cards);
			
			if (validation.isValid) {
				console.log('✅ Valid deal generated on attempt', attempts);
				console.log('   Declarer points:', declarerPoints, '+ Dummy points:', dummyPoints, '=', declarerPoints + dummyPoints);
				break; // Success! Exit the loop
			} else {
				console.log('🔧 Invalid deal - retrying...');
				console.log('   Issues:', validation.errors.join(', '));
			}
		}
		
		if (attempts >= maxAttempts) {
			console.log('⚠️ Warning: Could not generate valid deal after', maxAttempts, 'attempts');
		}
		
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
		
		const cardId = suit + '-' + rank;
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

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
	<div class="w-full mx-auto relative">
		<!-- Page Identifier -->
		<div class="absolute top-0 right-0 text-sm text-gray-500 font-mono">bpa-1</div>
		<!-- Breadcrumb Navigation -->
		<nav class="mb-6">
			<ol class="flex items-center space-x-2 text-sm text-gray-600">
				<li>
					<button 
						onclick={goToMain}
						class="hover:text-indigo-600 transition-colors font-medium"
					>
						Home
					</button>
				</li>
				<li class="flex items-center">
					<span class="mx-2">/</span>
					<button 
						onclick={goToBridgeAnalysis}
						class="hover:text-indigo-600 transition-colors font-medium"
					>
						Bridge Play Analysis
					</button>
				</li>
				<li class="flex items-center">
					<span class="mx-2">/</span>
					<span class="text-indigo-600 font-medium">Capture the Missing Trump</span>
				</li>
			</ol>
		</nav>

		<!-- Page Header -->
		<header class="text-center mb-8">
			<h1 class="text-4xl font-bold text-indigo-800 mb-2">Capture the Missing Trump</h1>
			<p class="text-gray-600">Learn to identify and capture missing trump cards in bridge play scenarios</p>
		</header>

		<!-- Game Stats -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="grid grid-cols-2 gap-6 text-center">
				<div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
					<h3 class="text-lg font-bold text-red-800 mb-2">Opponents Tricks</h3>
					<p class="text-3xl font-bold text-red-600">{opponentsTricks}</p>
				</div>
				<div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
					<h3 class="text-lg font-bold text-blue-800 mb-2">Declarer's Tricks</h3>
					<p class="text-3xl font-bold text-blue-600">{declarerTricks}</p>
				</div>
			</div>
		</div>

		<!-- Game Options -->
		{#if !gameStarted}
			<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
				<div class="space-y-4">
					<h3 class="text-lg font-bold text-gray-800 mb-4">Opponent Play Level</h3>
					
					<div class="space-y-3">
						<div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<input 
								type="radio" 
								name="opponentPlayLevel" 
								value="beginner" 
								bind:group={opponentPlayLevel}
								class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
							/>
							<div>
								<span class="text-gray-700 font-medium">Beginner level</span>
								<p class="text-sm text-gray-500">Random valid plays</p>
							</div>
						</div>
						
						<div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<input 
								type="radio" 
								name="opponentPlayLevel" 
								value="intermediate" 
								bind:group={opponentPlayLevel}
								class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
							/>
							<div>
								<span class="text-gray-700 font-medium">Intermediate level</span>
								<p class="text-sm text-gray-500">Basic strategy (hold trump, try to win tricks)</p>
							</div>
						</div>
						
						<div class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<input 
								type="radio" 
								name="opponentPlayLevel" 
								value="advanced" 
								bind:group={opponentPlayLevel}
								class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
							/>
							<div>
								<span class="text-gray-700 font-medium">Advanced level</span>
								<p class="text-sm text-gray-500">Complex counting and signaling</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- BPA-1 Hint System -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-bold text-gray-800">BPA-1 Hint System</h3>
					<button 
						onclick={toggleHints}
						class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md"
					>
						{hintsEnabled ? '🔔 Hints ON' : '🔕 Hints OFF'}
					</button>
				</div>
				
				{#if hintsEnabled && currentHint}
					<div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
						<div class="space-y-3">
							<div class="flex items-center justify-between">
								<h4 class="font-semibold text-blue-800">Current Hint:</h4>
								<div class="flex items-center space-x-2">
									{#if hintProbability > 0}
										<span class="text-sm font-medium text-blue-600">
											Success: {hintProbability}%
										</span>
										<span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
											{hintSuccessRate}
										</span>
									{/if}
								</div>
							</div>
							
							<p class="text-blue-700 font-medium">{currentHint}</p>
							
							{#if hintDetails}
								<div class="bg-white/70 rounded p-3">
									<p class="text-sm text-gray-700">{hintDetails}</p>
								</div>
							{/if}
							
							{#if hintPlaySequence.length > 0}
								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<h5 class="text-sm font-semibold text-blue-800">Play Sequence:</h5>
										<button 
											onclick={() => showPlaySequence = !showPlaySequence}
											class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
										>
											{showPlaySequence ? 'Hide' : 'Show'}
										</button>
									</div>
									
									{#if showPlaySequence}
										<div class="bg-white/70 rounded p-3 space-y-1">
											{#each hintPlaySequence as step, index}
												<div class="flex items-start space-x-2">
													<span class="text-xs font-semibold text-blue-600 mt-1">{index + 1}.</span>
													<p class="text-sm text-gray-700">{step}</p>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
							
							{#if hintAnalysis.options.length > 1}
								<div class="space-y-2">
									<div class="flex items-center justify-between">
										<h5 class="text-sm font-semibold text-blue-800">Alternative Options:</h5>
										<button 
											onclick={() => showHintDetails = !showHintDetails}
											class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
										>
											{showHintDetails ? 'Hide' : 'Show'}
										</button>
									</div>
									
									{#if showHintDetails}
										<div class="bg-white/70 rounded p-3 space-y-2">
											{#each hintAnalysis.options.slice(1) as option}
												<div class="border-l-2 border-blue-300 pl-3">
													<div class="flex items-center justify-between">
														<p class="text-sm font-medium text-gray-700">{option.play}</p>
														<span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
															{option.probability}%
														</span>
													</div>
													<p class="text-xs text-gray-600 mt-1">{option.reasoning}</p>
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{:else if hintsEnabled}
					<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
						<p class="text-gray-600 text-center">🤔 Start playing to receive hints...</p>
					</div>
				{:else}
					<div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
						<p class="text-gray-600 text-center">💡 Enable hints to get strategic guidance during play</p>
					</div>
				{/if}
			</div>
		</div>

		
		<!-- Game Controls -->
		<div class="bg-white rounded-xl shadow-lg p-6 mb-6">
			<div class="flex flex-wrap gap-4 justify-center items-center">
				{#if !gameStarted}
					<button 
						onclick={startGame}
						class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
					>
						Start Missing Trump Challenge
					</button>
				{:else}
					<!-- Game is started - show reset and options -->
					<div class="flex items-center space-x-3">
						<label class="flex items-center space-x-2 cursor-pointer">
							<input 
								type="checkbox" 
								bind:checked={showOpponentCards}
								class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
							/>
							<span class="text-sm font-medium text-gray-700">Show East/West Cards</span>
						</label>
						<button 
							onclick={resetGame}
							class="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
						>
							Reset Game
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Game Instructions (visible before game starts) -->
		{#if !gameStarted}
			<div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
				<h3 class="text-lg font-semibold text-blue-800 mb-2">Game Instructions:</h3>
				<ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
					<li>Click "Start Missing Trump Challenge" to begin the bridge game</li>
					<li>West opponent leads the first card automatically</li>
					<li>Click cards in Dummy and Declarer hands when it's their turn to play</li>
					<li>East opponent plays automatically</li>
					<li>Watch as tricks are completed and winners are determined</li>
					<li>Click "Next Trick" to continue to the next trick</li>
					<li>Game continues until all 13 tricks have been played</li>
				</ol>
				<ol class="text-sm text-blue-700 space-y-1 list-decimal list-inside">
					<li>Track your progress with the Found, Remaining, Attempted, and Incorrect counters</li>
				</ol>
			</div>
		{/if}

		<!-- Game Area -->
		{#if gameStarted}
			<div class="space-y-8">
				<!-- Game Status -->
				<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6">
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
								class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
							>
								Play Again
							</button>
						</div>
					{:else}
						<!-- Four Hands Layout - Fixed with explicit grid -->
						<div class="grid grid-cols-3 gap-6 w-full mx-auto" style="grid-template-rows: auto auto auto; grid-template-areas: '. dummy .' 'west trick east' '. declarer .';">
							<!-- Top - Hand 1 (North) - Dummy -->
							<div class="col-start-2 row-start-1" style="grid-area: dummy;">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl {getCurrentPlayerBorderClass('dummy')} p-4 w-full transition-all duration-300">
									<h3 class="text-lg font-bold mb-3 text-gray-800 text-center">Dummy</h3>
									<div class="space-y-2">
										{#each ['spades', 'hearts', 'clubs', 'diamonds'] as suit}
											<div class="flex flex-wrap gap-1 justify-center">
												{#each ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as rank}
													{@const cardId = `${suit}-${rank}`}
													{@const card = {suit: suit as 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: rank as '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A', id: `${suit}-${rank}`}}
													{@const isInHand = hand1Cards.some(c => c.suit === suit && c.rank === rank)}
													{#if isInHand}
														{@const isClickable = gameStarted && trickPhase === 'manual_play' && currentPlayerTurn === 'dummy'}
														{#if isClickable}
															<button
																type="button"
																class="cursor-pointer hover:scale-105 transition-transform bg-transparent border-0 p-0 m-0"
																onclick={() => handleManualCardClick(suit, rank, 'dummy')}
																onkeydown={(e) => {
																	if (e.key === 'Enter' || e.key === ' ') {
																		handleManualCardClick(suit, rank, 'dummy');
																	}
																}}
															>
																<Card 
																	card={card}
																	size="medium"
																	bridgeTheme={true}
																	showBack={false}
																	flipped={isCardFlipped(cardId)}
																	clickable={false}
																/>
															</button>
														{:else}
															<div>
																<Card 
																	card={card}
																	size="medium"
																	bridgeTheme={true}
																	showBack={false}
																	flipped={isCardFlipped(cardId)}
																	clickable={false}
																/>
															</div>
														{/if}
													{/if}
												{/each}
											</div>
										{/each}
									</div>
								</div>
							</div>

							<!-- Left - Hand 2 (West) -->
							<div class="col-start-1 row-start-2" style="grid-area: west;">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-4 w-full">
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
														{@const showFaceUp = showOpponentCards ? true : false}
														<Card 
															card={{...card, id: cardId}}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={showFaceUp}
															clickable={false}
														/>
													{/each}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							</div>

							<!-- Cards for current trick - Center -->
							<div class="col-start-2 row-start-2" style="grid-area: trick;">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-6 w-full pt-2">
									<h3 class="text-lg font-bold mb-4 text-gray-800 text-center">Cards for current trick</h3>
									<div class="space-y-4 h-32">
										{#if currentTrick.length > 0}
											<div class="flex flex-wrap gap-3 justify-center">
												{#each currentTrick as cardId, i}
													{@const [suit, rank] = cardId.split('-')}
													{@const card = {suit: suit as 'hearts' | 'diamonds' | 'clubs' | 'spades', rank: rank as '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A', id: `${suit}-${rank}`}}
													{@const player = trickCardPlayers[i]}
													{@const playerLabel = player === 'west' ? 'W' : player === 'dummy' ? 'Dum' : player === 'east' ? 'E' : 'Dec'}
													<div class="flex flex-col items-center">
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
														<div class="text-xs font-bold text-gray-600 mt-1">{playerLabel}</div>
													</div>
												{/each}
											</div>
										{:else}
											<div class="text-center text-gray-500 text-sm h-32 flex items-center justify-center">
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
									
									<!-- Next Trick Button -->
									{#if gameStarted && isWaitingForNextTrick}
										<div class="flex justify-center mt-4">
											<button 
												onclick={handleNextTrick}
												class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
											>
												Next Trick
											</button>
										</div>
									{/if}
								</div>
							</div>

							<!-- Right - Hand 3 (East) -->
							<div class="col-start-3 row-start-2" style="grid-area: east;">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-4 w-full">
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
														{@const showFaceUp = showOpponentCards ? true : false}
														<Card 
															card={{...card, id: cardId}}
															size="medium"
															bridgeTheme={true}
															showBack={false}
															flipped={showFaceUp}
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
							<div class="col-start-2 row-start-3" style="grid-area: declarer;">
								<div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl {getCurrentPlayerBorderClass('declarer')} p-4 w-full transition-all duration-300">
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
														{@const isClickable = gameStarted && trickPhase === 'manual_play' && currentPlayerTurn === 'declarer'}
														{#if isClickable}
															<button
																type="button"
																class="cursor-pointer hover:scale-105 transition-transform bg-transparent border-0 p-0 m-0"
																onclick={() => handleManualCardClick(card.suit, card.rank, 'declarer')}
																onkeydown={(e) => {
																	if (e.key === 'Enter' || e.key === ' ') {
																		handleManualCardClick(card.suit, card.rank, 'declarer');
																	}
																}}
															>
																<Card 
																	card={card}
																	size="medium"
																	bridgeTheme={true}
																	showBack={false}
																	flipped={isCardFlipped(cardId)}
																	clickable={false}
																/>
															</button>
														{:else}
															<div>
																<Card 
																	card={card}
																	size="medium"
																	bridgeTheme={true}
																	showBack={false}
																	flipped={isCardFlipped(cardId)}
																	clickable={false}
																/>
															</div>
														{/if}
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
					class="px-4 py-2 bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-left"
					onclick={goToBridgeAnalysis}
				>
					Bridge Play Analysis
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* Add any custom styles here */
</style>