import type { Card, Suit, Rank } from '$lib/types/bridge';

export function createDeck(): Card[] {
	const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	const deck: Card[] = [];
	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({ suit, rank });
		}
	}
	return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
	const shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function dealCards(deck: Card[]): Card[][] {
	const hands: Card[][] = [[], [], [], []];
	for (let i = 0; i < 52; i++) {
		hands[i % 4].push(deck[i]);
	}
	return hands;
}
