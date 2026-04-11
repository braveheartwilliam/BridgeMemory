import type { Card, Suit, Rank } from '$lib/types/bridge';
import { validateDeal } from './points';

export function createDeck(): Card[] {
	const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	const deck: Card[] = [];
	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({ suit, rank, id: `${suit}-${rank}` });
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

/**
 * Deal cards with bridge rules validation
 * Returns hands that satisfy all bridge point requirements
 * Declarer is South (player 2), Dummy is North (player 0)
 */
export function dealCardsWithValidation(deck: Card[], maxAttempts: number = 1000): {
	hands: Card[][];
	validation: {
		isValid: boolean;
		declarerPoints: number;
		dummyPoints: number;
		totalPoints: number;
		errors: string[];
	};
	attempts: number;
} {
	let attempts = 0;
	
	while (attempts < maxAttempts) {
		attempts++;
		
		// Shuffle and deal
		const shuffled = shuffleDeck(deck);
		const hands = dealCards(shuffled);
		
		// Declarer is South (index 2), Dummy is North (index 0)
		const declarerHand = hands[2]; // South
		const dummyHand = hands[0]; // North
		
		// Validate the deal
		const validation = validateDeal(declarerHand, dummyHand);
		
		if (validation.isValid) {
			return {
				hands,
				validation,
				attempts
			};
		}
	}
	
	// If no valid deal found after max attempts, return the last attempt
	const finalShuffled = shuffleDeck(deck);
	const finalHands = dealCards(finalShuffled);
	const finalValidation = validateDeal(finalHands[2], finalHands[0]);
	
	return {
		hands: finalHands,
		validation: finalValidation,
		attempts
	};
}
