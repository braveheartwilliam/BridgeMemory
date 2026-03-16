import type { GameState, Card, Player, Rank } from '$lib/types/bridge';
import { createDeck, shuffleDeck, dealCards } from './deck';

export function initializeGame(): GameState {
	const deck = createDeck();
	const shuffled = shuffleDeck(deck);
	const hands = dealCards(shuffled);
	
	const players: Player[] = [
		{ id: 0, name: 'North', hand: hands[0], isHuman: false },
		{ id: 1, name: 'East', hand: hands[1], isHuman: false },
		{ id: 2, name: 'South', hand: hands[2], isHuman: true },
		{ id: 3, name: 'West', hand: hands[3], isHuman: false }
	];
	
	return {
		players,
		currentPlayer: 0,
		trick: [],
		trickWinner: null,
		trickNumber: 1,
		deck: [],
		playedCards: [],
		isGameOver: false
	};
}

export function playCard(gameState: GameState, card: Card): GameState {
	const newState = { ...gameState };
	const player = newState.players[newState.currentPlayer];
	
	// Remove card from player's hand
	player.hand = player.hand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
	
	// Add card to trick
	newState.trick.push(card);
	
	// Update played cards
	newState.playedCards.push(card);
	
	// Move to next player
	newState.currentPlayer = (newState.currentPlayer + 1) % 4;
	
	// Check if trick is complete
	if (newState.trick.length === 4) {
		newState.trickWinner = determineTrickWinner(newState.trick);
		newState.currentPlayer = newState.trickWinner;
		newState.trick = [];
		newState.trickNumber++;
		
		if (newState.trickNumber > 13) {
			newState.isGameOver = true;
		}
	}
	
	return newState;
}

function determineTrickWinner(trick: Card[]): number {
	// Simple trick winner logic - first card sets the suit
	const leadSuit = trick[0].suit;
	let winner = 0;
	let highestRank = getRankValue(trick[0].rank);
	
	for (let i = 1; i < 4; i++) {
		if (trick[i].suit === leadSuit) {
			const rankValue = getRankValue(trick[i].rank);
			if (rankValue > highestRank) {
				highestRank = rankValue;
				winner = i;
			}
		}
	}
	
	return winner;
}

function getRankValue(rank: Rank): number {
	const values: Record<Rank, number> = {
		'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
		'J': 11, 'Q': 12, 'K': 13, 'A': 14
	};
	return values[rank];
}
