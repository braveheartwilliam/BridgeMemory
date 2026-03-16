import type { Card, GameState, Player } from '$lib/types/bridge';

export interface MemoryState {
	playedCards: Card[];
	remainingCards: Card[];
	playerHandEstimates: Card[][]; // Estimated cards for each player
}

export function initializeMemory(gameState: GameState): MemoryState {
	const allCards = createAllCards();
	const playedCards: Card[] = [];
	const remainingCards = [...allCards];
	const playerHandEstimates: Card[][] = [[], [], [], []];
	
	// Remove known cards from remaining
	for (const player of gameState.players) {
		for (const card of player.hand) {
			const index = remainingCards.findIndex(c => c.suit === card.suit && c.rank === card.rank);
			if (index !== -1) {
				remainingCards.splice(index, 1);
			}
		}
	}
	
	return {
		playedCards,
		remainingCards,
		playerHandEstimates
	};
}

export function updateMemory(memoryState: MemoryState, gameState: GameState): MemoryState {
	const newMemory = { ...memoryState };
	newMemory.playedCards = [...gameState.playedCards];
	
	// Update remaining cards
	newMemory.remainingCards = createAllCards().filter(card => 
		!newMemory.playedCards.some(played => played.suit === card.suit && played.rank === card.rank) &&
		!gameState.players.some(player => 
			player.hand.some(handCard => handCard.suit === card.suit && handCard.rank === card.rank)
		)
	);
	
	return newMemory;
}

function createAllCards(): Card[] {
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	const cards: Card[] = [];
	for (const suit of suits) {
		for (const rank of ranks) {
			cards.push({ suit, rank });
		}
	}
	return cards;
}
