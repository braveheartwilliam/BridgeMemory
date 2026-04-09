<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Card from '$lib/components/Card.svelte';
	import type { Card as BridgeCard } from '$lib/types/bridge';
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
	let trickPhase = $state<'setup' | 'playing' | 'waiting' | 'manual_play'>('setup'); // Game phase
	let trickTimer = $state<number | null>(null); // Timer for trick display
	let currentSetTricks = $state<string[][]>([]); // Tricks in current memory set
	let tricksInCurrentSet = $state(0); // Count of tricks in current set
	let isWaitingForNextTrick = $state<boolean>(false); // Track if waiting for Next Trick click
	let currentPlayerTurn = $state<'west' | 'dummy' | 'east' | 'declarer'>('west'); // Track whose turn it is
	
	// Bridge play counters
	let opponentsTricks = $state<number>(0); // Counter for tricks won by opponents (West + East)
	let declarerTricks = $state<number>(0); // Counter for tricks won by declarer/dummy partnership
	
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
			if (suitInfo.count > 0 && suit.suit !== 'hearts') { // Don't lead hearts unless very strong
				const probability = calculateLeadSuccessProbability(suitInfo, totalTricks);
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateLeadPlaySequence(suit, suitInfo);
				
				hints.push({
					play: `Lead ${getCardDescription(suitInfo.highest)} from ${suit}`,
					reasoning: `Strong ${suit} suit with ${suitInfo.count} cards and ${suitInfo.honorCount} honors. ${getLeadReasoning(suitInfo)}`,
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
				const probability = calculateFollowSuccessProbability(card, leadSuit);
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateFollowPlaySequence(card, leadSuit);
				
				hints.push({
					play: `Play ${getCardDescription(card)} from ${leadSuit}`,
					reasoning: getFollowReasoning(card, leadSuit, suitCards),
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
					const probability = calculateTrumpSuccessProbability(trumpCard);
					const successRate = getSuccessRateDescription(probability);
					const playSequence = generateTrumpPlaySequence(trumpCard);
					
					hints.push({
						play: `Play trump ${getCardDescription(trumpCard)}`,
						reasoning: getTrumpReasoning(trumpCard, trumpCards),
						probability: probability,
						successRate: successRate,
						playSequence: playSequence
					});
				}
			}
			
			// Non-trump discard options
			const nonTrumpCards = playerHand.filter(card => card.suit !== 'hearts');
			for (const discardCard of nonTrumpCards.slice(0, 2)) { // Top 2 discard options
				const probability = calculateDiscardSuccessProbability(discardCard);
				const successRate = getSuccessRateDescription(probability);
				const playSequence = generateDiscardPlaySequence(discardCard);
				
				hints.push({
					play: `Discard ${getCardDescription(discardCard)}`,
					reasoning: getDiscardReasoning(discardCard, nonTrumpCards),
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
				reasoning: `Need ${tricksNeeded} more tricks from ${tricksRemaining} remaining. Current progress: ${declarerTricks}/10 tricks.`,
				probability: probability,
				successRate: successRate,
				playSequence: playSequence
			});
		} else if (declarerTricks >= 10) {
			hints.push({
				play: 'Play for overtricks',
				reasoning: `Contract already made (${declarerTricks} tricks). Focus on maximizing tricks.`,
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

	// BPA-1 Hint System Helper Functions
	
	// Analyze hand suits for leading decisions
	function analyzeHandSuits(hand: Card[]) {
		const analysis: Record<string, {
			count: number;
			honorCount: number;
			highest: Card;
			lowest: Card;
			sequence: Card[];
		}> = {};
		
		for (const suit of ['spades', 'hearts', 'diamonds', 'clubs'] as const) {
			const suitCards = getCardsInSuit(hand, suit).sort((a, b) => {
				const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
				return rankOrder[b.rank] - rankOrder[a.rank];
			});
			
			const honors = suitCards.filter(card => ['A', 'K', 'Q', 'J', '10'].includes(card.rank));
			const sequence = findSequences(suitCards);
			
			analysis[suit] = {
				count: suitCards.length,
				honorCount: honors.length,
				highest: suitCards[0] || null,
				lowest: suitCards[suitCards.length - 1] || null,
				sequence: sequence
			};
		}
		
		return analysis;
	}
	
	// Find sequences in suit
	function findSequences(cards: Card[]): Card[] {
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
	function calculateFollowSuccessProbability(card: Card, leadSuit: string): number {
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
	function calculateTrumpSuccessProbability(trumpCard: Card): number {
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
	function calculateDiscardSuccessProbability(discardCard: Card): number {
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
	function getCardDescription(card: Card): string {
		if (!card) return 'Unknown';
		return `${card.rank} of ${card.suit}`;
	}
	
	// Get lead reasoning
	function getLeadReasoning(suitInfo: any): string {
		if (suitInfo.sequence.length >= 2) {
			return `Lead top of sequence to establish suit.`;
		}
		if (suitInfo.count >= 5) {
			return `Long suit - lead to establish length.`;
		}
		if (suitInfo.honorCount >= 2) {
			return `Strong suit with honors - good lead potential.`;
		}
		return `Safe lead from 4th highest card.`;
	}
	
	// Get follow reasoning
	function getFollowReasoning(card: Card, leadSuit: string, suitCards: Card[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[card.rank];
		const isHighest = cardRank === Math.max(...suitCards.map(c => rankOrder[c.rank]));
		
		if (isHighest && cardRank >= 12) {
			return `Play high honor to potentially win trick.`;
		}
		if (cardRank <= 5) {
			return `Play low card - conserve high cards for later.`;
		}
		if (suitCards.length === 2) {
			return `Second card - play appropriately based on partnership.`;
		}
		return `Standard follow suit play.`;
	}
	
	// Get trump reasoning
	function getTrumpReasoning(trumpCard: Card, trumpCards: Card[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[trumpCard.rank];
		const isHighest = cardRank === Math.max(...trumpCards.map(c => rankOrder[c.rank]));
		
		if (isHighest) {
			return `Play highest trump to win trick.`;
		}
		if (trumpCards.length > 3) {
			return `Plenty of trumps - can afford to play this one.`;
		}
		return `Conserve trumps - play low trump.`;
	}
	
	// Get discard reasoning
	function getDiscardReasoning(discardCard: Card, nonTrumpCards: Card[]): string {
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		const cardRank = rankOrder[discardCard.rank];
		
		if (cardRank <= 3) {
			return `Discard lowest card - no value.`;
		}
		if (cardRank <= 8) {
			return `Discard low card - minimal value.`;
		}
		return `Discard from longest suit to preserve short suits.`;
	}
	
	// Generate play sequences
	function generateLeadPlaySequence(suit: string, suitInfo: any): string[] {
		const sequence = [];
		sequence.push(`Lead ${getCardDescription(suitInfo.highest)} from ${suit}`);
		sequence.push(`Watch opponent responses to gauge strength`);
		sequence.push(`Plan to establish suit with subsequent leads`);
		return sequence;
	}
	
	function generateFollowPlaySequence(card: Card, leadSuit: string): string[] {
		const sequence = [];
		sequence.push(`Play ${getCardDescription(card)} to follow suit`);
		sequence.push(`Observe partner's card if applicable`);
		sequence.push(`Plan next trick based on outcome`);
		return sequence;
	}
	
	function generateTrumpPlaySequence(trumpCard: Card): string[] {
		const sequence = [];
		sequence.push(`Play trump ${getCardDescription(trumpCard)}`);
		sequence.push(`Draw opponent trumps if possible`);
		sequence.push(`Use remaining trumps to control play`);
		return sequence;
	}
	
	function generateDiscardPlaySequence(discardCard: Card): string[] {
		const sequence = [];
		sequence.push(`Discard ${getCardDescription(discardCard)}`);
		sequence.push(`Signal strength/weakness to partner`);
		sequence.push(`Preserve key cards for future tricks`);
		return sequence;
	}
	
	function generateEndgameSequence(): string[] {
		const sequence = [];
		const tricksNeeded = 10 - declarerTricks;
		sequence.push(`Focus on making ${tricksNeeded} more tricks`);
		sequence.push(`Cash established winners first`);
		sequence.push(`Use trump to control remaining tricks`);
		sequence.push(`Preserve entries to both hands`);
		return sequence;
	}
	
	function generateOvertrickSequence(): string[] {
		const sequence = [];
		sequence.push(`Contract secured - play for maximum tricks`);
		sequence.push(`Test opponent distributions`);
		sequence.push(`Set up finesses for extra tricks`);
		sequence.push(`Use trump efficiently for overtricks`);
		return sequence;
	}
	
	// Parse card ID to Card object
	function parseCardId(cardId: string): Card | null {
		const parts = cardId.split('-');
		if (parts.length !== 2) return null;
		
		return {
			suit: parts[0] as Suit,
			rank: parts[1]
		};
	}
	
	// Update hint generation calls in existing functions
	function updateHintsIfEnabled() {
		if (hintsEnabled && gameStarted && !gameCompleted) {
			generateHint();
		}
	}

	// Simple test counter
	let buttonClickCount = $state<number>(0);

	// Basic test - should always show current state
	$effect(() => {
		console.log('🧪 Component test - gameStarted:', gameStarted);
		console.log('🧪 Component test - gameCompleted:', gameCompleted);
		console.log('🧪 Component test - flippedCardIds:', flippedCardIds);
		console.log('🧪 Component test - correctlyMatchedCards:', correctlyMatchedCards);
		
		// Auto-update hints when game state changes
		if (hintsEnabled && gameStarted && !gameCompleted) {
			updateHintsIfEnabled();
		}
	});

	// Card data for Game 3-2 (4 hands)
	let hand1Cards = $state<BridgeCard[]>([]);
	let hand2Cards = $state<BridgeCard[]>([]);
	let hand3Cards = $state<BridgeCard[]>([]);
	let hand4Cards = $state<BridgeCard[]>([]);
	let allPossibleCards = $state<BridgeCard[]>([]);

	// Initialize cards with bridge-specific deal logic
	function initializeCards() {
		console.log('🎴 Initializing Bridge Play Analysis cards with heart requirements');
		
		// Create all 52 cards
		const suits = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
		const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
		
		allPossibleCards = [];
		for (const suit of suits) {
			for (const rank of ranks) {
				allPossibleCards.push({ suit, rank });
			}
		}

		// Bridge-specific deal logic for heart requirements
		const heartHonors = ['A', 'K', 'Q', 'J', '10']; // Updated to include 10
		const allHeartCards = allPossibleCards.filter(card => card.suit === 'hearts');
		const nonHeartCards = allPossibleCards.filter(card => card.suit !== 'hearts');
		
		// Step 1: Deal heart honors to Declarer and Dummy (minimum 3 total)
		const availableHeartHonors = allHeartCards.filter(card => heartHonors.includes(card.rank));
		const shuffledHonors = [...availableHeartHonors].sort(() => Math.random() - 0.5);
		
		// Randomly select 3-5 honors (minimum 3, maximum all 5)
		const honorCount = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 honors
		const selectedHonors = shuffledHonors.slice(0, honorCount);
		
		// Randomly split honors between Declarer and Dummy
		const declarerHonors: typeof selectedHonors = [];
		let dummyHonors: typeof selectedHonors = [];
		
		selectedHonors.forEach(honor => {
			if (Math.random() < 0.5) {
				declarerHonors.push(honor);
			} else {
				dummyHonors.push(honor);
			}
		});
		
		// Step 2: Add additional hearts to reach exactly 7-9 total hearts between Declarer and Dummy
		const nonHonorHearts = allHeartCards.filter(card => 
			!heartHonors.includes(card.rank)
		);
		
		// Step 3: Deal remaining cards to complete the hands
		const remainingCards = allPossibleCards.filter(card => 
			!selectedHonors.some(honor => honor.suit === card.suit && honor.rank === card.rank)
		);
		
		// Shuffle remaining cards
		const shuffledRemaining = [...remainingCards].sort(() => Math.random() - 0.5);
		
		// Add cards to make 13 cards per hand
		const declarerNeeded = 13 - declarerHonors.length;
		const dummyNeeded = 13 - dummyHonors.length;
		
		// Deal cards to Declarer and Dummy (ensure exactly 13 cards each)
		hand4Cards = [...declarerHonors];
		hand1Cards = [...dummyHonors];
		
		// Add remaining cards to make exactly 13 per hand
		let cardIndex = 0;
		
		// Fill Declarer hand to 13 cards
		while (hand4Cards.length < 13 && cardIndex < shuffledRemaining.length) {
			hand4Cards.push(shuffledRemaining[cardIndex++]);
		}
		
		// Fill Dummy hand to 13 cards
		while (hand1Cards.length < 13 && cardIndex < shuffledRemaining.length) {
			hand1Cards.push(shuffledRemaining[cardIndex++]);
		}
		
		// Deal remaining cards to West and East (13 each)
		hand2Cards = shuffledRemaining.slice(cardIndex, cardIndex + 13);  // West
		cardIndex += 13;
		hand3Cards = shuffledRemaining.slice(cardIndex, cardIndex + 13);  // East
		
		
		// CRITICAL: Ensure Declarer has at least 5 hearts
		const declarerHearts = hand4Cards.filter(c => c.suit === 'hearts').length;
		if (declarerHearts < 5) {
			console.log('🔧 CRITICAL: Declarer only has', declarerHearts, 'hearts, needs 5+');
			// Move hearts from Dummy to Declarer, maintaining 13-card hand sizes
			let dummyHearts = hand1Cards.filter(c => c.suit === 'hearts');
			const heartsNeeded = 5 - declarerHearts;
			
			for (let i = 0; i < heartsNeeded && i < dummyHearts.length; i++) {
				const heartToMove = dummyHearts[i];
				
				// Remove heart from Dummy
				hand1Cards = hand1Cards.filter(c => c !== heartToMove);
				
				// Remove a non-heart from Declarer to maintain 13 cards
				const declarerNonHearts = hand4Cards.filter(c => c.suit !== 'hearts');
				if (declarerNonHearts.length > 0) {
					const nonHeartToRemove = declarerNonHearts[0];
					hand4Cards = hand4Cards.filter(c => c !== nonHeartToRemove);
					
					// Add the removed non-heart to Dummy to maintain 13 cards
					hand1Cards = [...hand1Cards, nonHeartToRemove];
				}
				
				// Add the heart to Declarer
				hand4Cards = [...hand4Cards, heartToMove];
				console.log('🔧 Moving heart from Dummy to Declarer:', heartToMove.rank);
			}
		}
		
		// CRITICAL: Ensure Declarer+Dummy have at least 8 hearts total
		const totalHeartsDeclarerDummy = hand4Cards.filter(c => c.suit === 'hearts').length + 
		                                   hand1Cards.filter(c => c.suit === 'hearts').length;
		
		if (totalHeartsDeclarerDummy < 8) {
			console.log('🔧 CRITICAL: Declarer+Dummy only have', totalHeartsDeclarerDummy, 'hearts, need 8+');
			// Need to move hearts from opponents to partnership
			const heartsNeeded = 8 - totalHeartsDeclarerDummy;
			let heartsMoved = 0;
			
			// Try to get hearts from West first
			const westHearts = hand2Cards.filter(c => c.suit === 'hearts');
			for (let i = 0; i < westHearts.length && heartsMoved < heartsNeeded; i++) {
				const heartToMove = westHearts[i];
				
				// Move heart from West to Dummy
				hand2Cards = hand2Cards.filter(c => c !== heartToMove);
				hand1Cards = [...hand1Cards, heartToMove];
				
				// Remove a non-heart from Dummy to maintain 13 cards
				const dummyNonHearts = hand1Cards.filter(c => c.suit !== 'hearts');
				if (dummyNonHearts.length > 0) {
					const nonHeartToRemove = dummyNonHearts[0];
					hand1Cards = hand1Cards.filter(c => c !== nonHeartToRemove);
					hand2Cards = [...hand2Cards, nonHeartToRemove];
				}
				
				console.log('🔧 Moving heart from West to Dummy:', heartToMove.rank);
				heartsMoved++;
			}
			
			// If still need more hearts, get from East
			if (heartsMoved < heartsNeeded) {
				const eastHearts = hand3Cards.filter(c => c.suit === 'hearts');
				for (let i = 0; i < eastHearts.length && heartsMoved < heartsNeeded; i++) {
					const heartToMove = eastHearts[i];
					
					// Move heart from East to Dummy
					hand3Cards = hand3Cards.filter(c => c !== heartToMove);
					hand1Cards = [...hand1Cards, heartToMove];
					
					// Remove a non-heart from Dummy to maintain 13 cards
					const dummyNonHearts = hand1Cards.filter(c => c.suit !== 'hearts');
					if (dummyNonHearts.length > 0) {
						const nonHeartToRemove = dummyNonHearts[0];
						hand1Cards = hand1Cards.filter(c => c !== nonHeartToRemove);
						hand3Cards = [...hand3Cards, nonHeartToRemove];
					}
					
					console.log('🔧 Moving heart from East to Dummy:', heartToMove.rank);
					heartsMoved++;
				}
			}
		}
		
		// Log final deal statistics
		const totalHonorsDeclarerDummy = [...hand4Cards, ...hand1Cards]
			.filter(c => c.suit === 'hearts' && ['A', 'K', 'Q', 'J', '10'].includes(c.rank))
			.length;
		
		console.log('🎴 Total Hearts Declarer+Dummy:', totalHeartsDeclarerDummy, '(target: 7-9)');
		console.log('🎴 Total Heart Honors Declarer+Dummy:', totalHonorsDeclarerDummy, '(target: min 3)');
		console.log('🎴 Total cards distributed:', hand1Cards.length + hand2Cards.length + hand3Cards.length + hand4Cards.length);
	}

	// Return to setup phase for new deal
	function returnToSetupPhase() {
		console.log('🔄 Returning to setup phase for new deal');
		trickPhase = 'setup';
		feedbackMessage = 'Click "Start Missing Trump Challenge" to begin with a new deal';
		isWaitingForNextTrick = false;
	}
	
	// Start the game
	function startGame() {
		// CRITICAL: Validate deal before starting gameplay
		const declarerPoints = calculateHandPoints(hand4Cards);
		const dummyPoints = calculateDummyPoints(hand1Cards);
		const totalPoints = declarerPoints + dummyPoints;
		const validation = validateDeal(hand4Cards, hand1Cards);
		
		if (!validation.isValid) {
			console.error('❌ Invalid deal - cannot start game');
			console.error('Validation errors:', validation.errors);
			feedbackMessage = 'Invalid deal - please reset and try again';
			return;
		}
		
		console.log('🎮 Starting Bridge Play Analysis');
		console.log('🎴 Declarer and Dummy cards set as face-up:', hand4Cards.length + hand1Cards.length, 'cards');
		
		// Set game state
		gameStarted = true;
		gameCompleted = false;
		allCardsFlippedOnce = false;
		lastCardFlippedBack = false;
		
		// Reset bridge play counters
		opponentsTricks = 0;
		declarerTricks = 0;
		
		// Reset trick-based state
		currentTrick = [];
		trickCardPlayers = []; // Clear player tracking
		currentTrickIndex = 0;
		trickPhase = 'setup'; // Keep in setup phase, let setupFaceUpCards handle transition
		
		// Set up face-up cards for declarer and dummy
		setupFaceUpCards();
		// Note: selectNextCardForTrick() should NOT be called here - it removes cards from hands
	}
	
	// Set up face-up cards for declarer and dummy
	function setupFaceUpCards() {
		const declarerAndDummyCards = [...hand1Cards, ...hand4Cards];
		correctlyMatchedCards = declarerAndDummyCards.map(card => `${card.suit}-${card.rank}`);
		console.log('🎴 Declarer and Dummy cards set as face-up:', correctlyMatchedCards.length, 'cards');
		
		// Add Declarer and Dummy cards to handCardFlippedIds so they appear face-up
		handCardFlippedIds = [...correctlyMatchedCards];
		
		// Start interactive gameplay
		console.log('🃏 Starting interactive bridge gameplay');
		trickPhase = 'waiting';
		currentSetTricks = [];
		tricksInCurrentSet = 0;
		currentTrick = [];
		currentTrickIndex = 0;
		isWaitingForNextTrick = true;
		currentPlayerTurn = 'west';
		feedbackMessage = 'Click "Next Trick" to begin playing cards';
		setTimeout(() => {
			feedbackMessage = '';
		}, 3000);
	}
	
	// Check if card is correctly matched
	function checkIsCorrectMatch(cardId: string): boolean {
		return correctlyMatchedCards.includes(cardId);
	}

	// Next Trick button handler
	function handleNextTrick() {
		console.log('🎯 Next Trick clicked - starting new trick');
		console.log('🔍 Debug: isWaitingForNextTrick before =', isWaitingForNextTrick);
		isWaitingForNextTrick = false;
		console.log('🔍 Debug: isWaitingForNextTrick after =', isWaitingForNextTrick, '(button should disappear)');
		trickPhase = 'playing';
		
		// Clear current trick for new trick (MOVED from trick completion logic)
		console.log('🗑️ Clearing previous trick cards - ready for new trick');
		currentTrick = [];
		trickCardPlayers = []; // Clear player tracking
		currentTrickIndex = 0;
		
		// Use the winner of previous trick as leader (already set in currentPlayerTurn)
		console.log('👑 Trick leader:', currentPlayerTurn);
		
		// Start with the current player (winner of previous trick) playing first
		if (currentPlayerTurn === 'west') {
			playWestCard();
		} else if (currentPlayerTurn === 'east') {
			playEastCard();
		} else if (currentPlayerTurn === 'dummy') {
			playDummyCard();
		} else if (currentPlayerTurn === 'declarer') {
			playDeclarerCard();
		}
		
		// Update hints if enabled
		updateHintsIfEnabled();
	}

	// Helper function to get the lead suit of the current trick
	function getLeadSuit(): string | null {
		if (currentTrick.length === 0) return null;
		
		// Find the first card played (lead card)
		const leadCardId = currentTrick[0];
		const [leadSuit] = leadCardId.split('-');
		return leadSuit;
	}

	// Helper function to get cards in a specific suit
	function getCardsInSuit(hand: BridgeCard[], suit: string): BridgeCard[] {
		return hand.filter(card => card.suit === suit);
	}

	// Helper function to play a card following bridge rules
	function playCardFollowingSuit(hand: BridgeCard[], playerName: string): BridgeCard | null {
		if (hand.length === 0) return null;
		
		const leadSuit = getLeadSuit();
		
		// If this is the first card played, any card can be played
		if (!leadSuit) {
			return hand[Math.floor(Math.random() * hand.length)];
		}
		
		// Check if player has cards in the lead suit
		const suitCards = getCardsInSuit(hand, leadSuit);
		
		if (suitCards.length > 0) {
			// Must follow suit - play a random card from the lead suit
			console.log(`🎯 ${playerName} must follow suit: ${leadSuit} (${suitCards.length} cards available)`);
			return suitCards[Math.floor(Math.random() * suitCards.length)];
		} else {
			// Can't follow suit - play any card
			console.log(`🎯 ${playerName} cannot follow suit ${leadSuit} - playing any card`);
			return hand[Math.floor(Math.random() * hand.length)];
		}
	}

	// West opponent plays a card (automatic)
	function playWestCard() {
		console.log('🃏 West opponent playing card');
		currentPlayerTurn = 'west';
		
		if (hand2Cards.length === 0) {
			console.log('❌ West has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Play a card following bridge rules
		const selectedCard = playCardFollowingSuit(hand2Cards, 'West');
		
		if (!selectedCard) {
			console.log('❌ No card selected for West');
			advanceToNextPlayer();
			return;
		}
		
		const cardId = `${selectedCard.suit}-${selectedCard.rank}`;
		
		// Add to current trick and track player
		currentTrick.push(cardId);
		trickCardPlayers.push('west');
		
		// Remove from West's hand
		hand2Cards = hand2Cards.filter(card => !(card.suit === selectedCard.suit && card.rank === selectedCard.rank));
		
		console.log('🎴 West played:', cardId);
		console.log('🎴 Current trick:', currentTrick);
		console.log('🎴 Trick players:', trickCardPlayers);
		
		// Advance to next player
		advanceToNextPlayer();
	}

	// Determine trick winner based on bridge rules
	function determineTrickWinner(): 'west' | 'dummy' | 'east' | 'declarer' {
		if (currentTrick.length !== 4) {
			console.log('🚫 Error: Cannot determine winner with', currentTrick.length, 'cards');
			return 'west'; // Default fallback
		}
		
		console.log('🎯 Determining winner for trick:', currentTrick);
		
		// Get the lead suit (first card played)
		const [leadSuit, leadRank] = currentTrick[0].split('-');
		console.log('🃏 Lead suit:', leadSuit, 'Lead rank:', leadRank);
		
		// Track cards played by each player
		const cardsByPlayer: { [key: string]: { suit: string, rank: string, cardId: string } } = {};
		
		// Map trick cards to players using actual trickCardPlayers order
		// trickCardPlayers contains the actual order: ['dummy', 'east', 'declarer', 'west']
		currentTrick.forEach((cardId, index) => {
			const [suit, rank] = cardId.split('-');
			const player = trickCardPlayers[index]; // Use actual player order
			cardsByPlayer[player] = { suit, rank, cardId };
		});
		
		// Determine winning card according to bridge rules
		let winningPlayer = trickCardPlayers[0]; // Start with lead player (actual order)
		let winningCard = cardsByPlayer[winningPlayer];
		
		// Card rank order (high to low)
		const rankOrder = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
		
		// First, check if any trump (hearts) were played
		const trumpCards = [];
		for (const player of trickCardPlayers) {
			const card = cardsByPlayer[player];
			if (card.suit === 'hearts') {
				trumpCards.push({ player, card });
			}
		}
		
		if (trumpCards.length > 0) {
			// Trump was played - find highest trump
			let highestTrump = trumpCards[0];
			for (const trump of trumpCards) {
				if (rankOrder[trump.card.rank] > rankOrder[highestTrump.card.rank]) {
					highestTrump = trump;
				}
			}
			winningPlayer = highestTrump.player;
			winningCard = highestTrump.card;
			console.log('👑 Trump wins:', winningPlayer, 'with', winningCard.rank, 'of hearts');
		} else {
			// No trump played - find highest card of lead suit
			const leadSuitCards = [];
			for (const player of trickCardPlayers) {
				const card = cardsByPlayer[player];
				if (card.suit === leadSuit) {
					leadSuitCards.push({ player, card });
				}
			}
			
			if (leadSuitCards.length > 0) {
				// Find highest card of lead suit
				let highestLeadSuit = leadSuitCards[0];
				for (const leadSuitCard of leadSuitCards) {
					if (rankOrder[leadSuitCard.card.rank] > rankOrder[highestLeadSuit.card.rank]) {
						highestLeadSuit = leadSuitCard;
					}
				}
				winningPlayer = highestLeadSuit.player;
				winningCard = highestLeadSuit.card;
				console.log('📈 Highest lead suit:', winningPlayer, 'with', winningCard.rank, 'of', leadSuit);
			}
		}
		
		console.log('🏆 Winning card:', winningCard.cardId, 'by', winningPlayer);
		return winningPlayer;
	}
	
	// Advance to next player in turn
	function advanceToNextPlayer() {
		console.log('🔄 Advancing to next player from:', currentPlayerTurn);
		console.log('🔍 Debug: currentTrick.length =', currentTrick.length, 'currentTrick =', currentTrick);
		
		if (currentTrick.length >= 4) {
			// Trick is complete - determine winner and update counters
			console.log('✅ Trick complete with 4 cards');
			
			// Determine trick winner
			const winner = determineTrickWinner();
			console.log('🏆 Trick winner:', winner);
			
			// Update appropriate counter
			if (winner === 'declarer' || winner === 'dummy') {
				declarerTricks++;
				console.log('📈 Declarer/Dummy tricks:', declarerTricks);
			} else {
				opponentsTricks++;
				console.log('📈 Opponents tricks:', opponentsTricks);
			}
			
			// Check if all 13 tricks have been played (GAME OVER)
			const totalTricks = declarerTricks + opponentsTricks;
			if (totalTricks >= 13) {
				console.log('🎮 GAME OVER! All 13 tricks completed');
				console.log('📊 Final Score: Declarer/Dummy', declarerTricks, 'vs Opponents', opponentsTricks);
				
				// Set game state to completed
				gameCompleted = true;
				trickPhase = 'completed';
				isWaitingForNextTrick = false; // Hide "Next Trick" button forever
				feedbackMessage = 'Game Over! All 13 tricks have been played.';
				setTimeout(() => {
					feedbackMessage = '';
				}, 5000);
				
				console.log('🎯 Game completion finished - Next Trick button disabled');
				return; // Exit early - game is over
			}
			
			// Set next trick leader to the winner
			currentPlayerTurn = winner;
			console.log('👑 Next trick leader:', currentPlayerTurn);
			
			// Store completed trick for display
			completedTricks = [...completedTricks, ...currentTrick];
			
			// NOTE: Keep current trick visible until "Next Trick" is clicked
			// currentTrick = []; // MOVED to handleNextTrick()
			// trickCardPlayers = []; // MOVED to handleNextTrick()
			// currentTrickIndex = 0; // MOVED to handleNextTrick()
			
			trickPhase = 'waiting';
			isWaitingForNextTrick = true;
			console.log('🔍 Debug: isWaitingForNextTrick set to', isWaitingForNextTrick, '(button should appear)');
			feedbackMessage = `Trick complete! ${winner === 'declarer' || winner === 'dummy' ? 'Declarer/Dummy' : 'Opponents'} won the trick. Click "Next Trick" to continue`;
			setTimeout(() => {
				feedbackMessage = '';
			}, 3000);
			
			console.log('🎯 Trick completion finished - keeping current trick visible until Next Trick clicked');
			return; // Exit early after trick completion
		}
		
		// Determine next player
		// Check if this is the start of a new trick (current player is the leader)
		if (currentTrick.length === 0) {
			// This is the start of a new trick - current player should lead
			console.log('🃏 Starting new trick -', currentPlayerTurn, 'should lead');
			if (currentPlayerTurn === 'west') {
				playWestCard();
			} else if (currentPlayerTurn === 'dummy') {
				playDummyCard();
			} else if (currentPlayerTurn === 'east') {
				playEastCard();
			} else if (currentPlayerTurn === 'declarer') {
				playDeclarerCard();
			}
		} else {
			// This is during a trick - determine next player
			switch (currentPlayerTurn) {
				case 'west':
					currentPlayerTurn = 'dummy';
					console.log('🃏 Next player: Dummy (manual play required)');
					trickPhase = 'manual_play';
					feedbackMessage = 'Click a card in Dummy hand to play';
					setTimeout(() => {
						feedbackMessage = '';
					}, 2000);
					break;
				case 'dummy':
					currentPlayerTurn = 'east';
					console.log('🃏 Next player: East (automatic play)');
					playEastCard();
					break;
				case 'east':
					currentPlayerTurn = 'declarer';
					console.log('🃏 Next player: Declarer (manual play required)');
					trickPhase = 'manual_play';
					feedbackMessage = 'Click a card in Declarer hand to play';
					setTimeout(() => {
						feedbackMessage = '';
					}, 2000);
					break;
				case 'declarer':
					currentPlayerTurn = 'west';
					console.log('🃏 Next player: West (automatic play)');
					playWestCard();
					break;
			}
		}
	}

	// East opponent plays a card (automatic)
	function playEastCard() {
		console.log('🃏 East opponent playing card');
		currentPlayerTurn = 'east';
		
		if (hand3Cards.length === 0) {
			console.log('❌ East has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Play a card following bridge rules
		const selectedCard = playCardFollowingSuit(hand3Cards, 'East');
		
		if (!selectedCard) {
			console.log('❌ No card selected for East');
			advanceToNextPlayer();
			return;
		}
		
		const cardId = `${selectedCard.suit}-${selectedCard.rank}`;
		
		// Add to current trick and track player
		currentTrick.push(cardId);
		trickCardPlayers.push('east');
		
		// Remove from East's hand
		hand3Cards = hand3Cards.filter(card => !(card.suit === selectedCard.suit && card.rank === selectedCard.rank));
		
		console.log('🎴 East played:', cardId);
		console.log('🎴 Current trick:', currentTrick);
		console.log('🎴 Trick players:', trickCardPlayers);
		
		// Advance to next player
		advanceToNextPlayer();
	}

	// Dummy plays a card (MANUAL - user must click)
	function playDummyCard() {
		console.log('🃏 Dummy turn - waiting for manual card click');
		currentPlayerTurn = 'dummy';
		
		if (hand1Cards.length === 0) {
			console.log('❌ Dummy has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Set phase to manual play and wait for user to click a card
		trickPhase = 'manual_play';
		feedbackMessage = "Dummy turn - click a card to play";
		console.log('👆 Waiting for user to click Dummy card');
		
		// DO NOT play automatically - wait for handleManualCardClick()
	}

	// Declarer plays a card (MANUAL - user must click)
	function playDeclarerCard() {
		console.log('🃏 Declarer turn - waiting for manual card click');
		currentPlayerTurn = 'declarer';
		
		if (hand4Cards.length === 0) {
			console.log('❌ Declarer has no cards left');
			advanceToNextPlayer();
			return;
		}
		
		// Set phase to manual play and wait for user to click a card
		trickPhase = 'manual_play';
		feedbackMessage = "Declarer turn - click a card to play";
		console.log('👆 Waiting for user to click Declarer card');
		
		// DO NOT play automatically - wait for handleManualCardClick()
	}

	// Handle manual card click from Dummy or Declarer
	function handleManualCardClick(suit: string, rank: string, hand: 'dummy' | 'declarer') {
		console.log('🎴 Manual card click:', `${suit}-${rank} from ${hand}`);
		
		if (trickPhase !== 'manual_play') {
			console.log('❌ Not in manual play phase');
			return;
		}
		
		// Check if it's the correct player's turn
		if (hand === 'dummy' && currentPlayerTurn !== 'dummy') {
			console.log('❌ Not Dummy\'s turn');
			return;
		}
		if (hand === 'declarer' && currentPlayerTurn !== 'declarer') {
			console.log('❌ Not Declarer\'s turn');
			return;
		}
		
		const cardId = `${suit}-${rank}`;
		
		// CRITICAL: Check if player must follow suit
		const leadSuit = getLeadSuit();
		if (leadSuit) {
			// Get the player's hand
			const playerHand = hand === 'dummy' ? hand1Cards : hand4Cards;
			
			// Check if player has cards in the lead suit
			const suitCards = getCardsInSuit(playerHand, leadSuit);
			
			if (suitCards.length > 0) {
				// Player has cards in lead suit - MUST follow suit
				if (suit !== leadSuit) {
					console.log('❌ SUIT FOLLOWING VIOLATION: Must play', leadSuit, 'but tried to play', suit);
					feedbackMessage = `You must follow suit! Play a ${leadSuit} card.`;
					setTimeout(() => {
						feedbackMessage = '';
					}, 3000);
					return; // Prevent the invalid play
				}
			} else {
				// Player has no cards in lead suit - can play any card (including trump)
				console.log('🎯 Player cannot follow suit', leadSuit, '- may play any card including trump');
			}
		}
		
		// Add to current trick and track player
		currentTrick.push(cardId);
		trickCardPlayers.push(hand);
		
		// Remove from appropriate hand
		if (hand === 'dummy') {
			hand1Cards = hand1Cards.filter(card => !(card.suit === suit && card.rank === rank));
		} else {
			hand4Cards = hand4Cards.filter(card => !(card.suit === suit && card.rank === rank));
		}
		
		console.log('🎴', hand, 'played:', cardId);
		console.log('🎴 Current trick:', currentTrick);
		console.log('🎴 Trick players:', trickCardPlayers);
		
		// Set to playing phase and advance to next player
		console.log('🔄 About to set trickPhase to playing and advance to next player');
		trickPhase = 'playing';
		advanceToNextPlayer();
		console.log('✅ Successfully called advanceToNextPlayer');
		
		// Update hints if enabled
		updateHintsIfEnabled();
	}

	// Reset the game
	function resetGame() {
		console.log('🔄 Resetting Bridge Play Analysis');
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
		
		// Reset bridge play counters
		opponentsTricks = 0;
		declarerTricks = 0;
		
		// Reset trick-based state
		currentTrick = [];
		trickCardPlayers = []; // Clear player tracking
		completedTricks = [];
		currentTrickIndex = 0;
		trickPhase = 'setup';
		currentSetTricks = [];
		tricksInCurrentSet = 0;
		
		// Clear hints when game resets
		clearHint();
		
		// Generate cards with retry logic for valid deals
		let attempts = 0;
		const maxAttempts = 50;
		
		while (attempts < maxAttempts) {
			attempts++;
			console.log(`🔄 Reset: Generating deal attempt ${attempts}/${maxAttempts}`);
			
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

	// Helper function to get border styling for current player
	function getCurrentPlayerBorderClass(player: 'dummy' | 'declarer'): string {
		if (trickPhase === 'manual_play' && currentPlayerTurn === player) {
			return player === 'dummy' 
				? 'border-4 border-green-500 shadow-green-500/50 shadow-lg' 
				: 'border-4 border-blue-500 shadow-blue-500/50 shadow-lg';
		}
		return 'border border-indigo-100';
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
		const isCorrectMatch = checkIsCorrectMatch(cardId);
		
		if (isCorrectMatch) {
			// Add to correctly matched cards
			correctlyMatchedCards = [...correctlyMatchedCards, cardId];
			feedbackMessage = 'Correct! Card stays face up.';
			
			// Check if game is completed (all 52 cards found)
			if (correctlyMatchedCards.length === 52) {
				gameCompleted = true;
				feedbackMessage = `🎉 Congratulations! You found all 52 cards in ${attemptCount} attempts!`;
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
			console.log(`🔄 Mount: Generating deal attempt ${attempts}/${maxAttempts}`);
			
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
													{@const card = {suit, rank}}
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
															card={card}
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
													{@const card = {suit, rank}}
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
															card={card}
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