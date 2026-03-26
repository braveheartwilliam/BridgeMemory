import type { Card, Suit } from '$lib/types/bridge';

/**
 * Calculate the point value of a face card
 * Aces = 4, Kings = 3, Queens = 2, Jacks = 1
 */
export function getCardPointValue(card: Card): number {
	switch (card.rank) {
		case 'A': return 4;
		case 'K': return 3;
		case 'Q': return 2;
		case 'J': return 1;
		default: return 0;
	}
}

/**
 * Calculate total points in a hand from face cards
 */
export function calculateHandPoints(hand: Card[]): number {
	return hand.reduce((total, card) => total + getCardPointValue(card), 0);
}

/**
 * Count the number of cards in a specific suit
 */
export function countSuitCards(hand: Card[], suit: Suit): number {
	return hand.filter(card => card.suit === suit).length;
}

/**
 * Calculate declarer points including trump suit bonuses
 * Declarer must have at least 12 points
 * Declarer MUST always have at least 5 trump (hearts) cards
 * Declarer earns 1 point extra for each card more than 5 in the trump suit (hearts)
 */
export function calculateDeclarerPoints(hand: Card[]): number {
	const basePoints = calculateHandPoints(hand);
	const trumpCount = countSuitCards(hand, 'hearts');
	
	// Declarer must have at least 5 hearts (trump cards)
	if (trumpCount < 5) {
		throw new Error(`Declarer must have at least 5 trump cards, but only has ${trumpCount}`);
	}
	
	// Add bonus for extra trump cards beyond 5
	const trumpBonus = Math.max(0, trumpCount - 5);
	const totalPoints = basePoints + trumpBonus;
	
	// Declarer must have at least 12 points
	if (totalPoints < 12) {
		throw new Error(`Declarer must have at least 12 points, but only has ${totalPoints}`);
	}
	
	// Declarer must have less than 20 points
	if (totalPoints >= 20) {
		throw new Error(`Declarer must have less than 20 points, but has ${totalPoints}`);
	}
	
	return totalPoints;
}

/**
 * Calculate dummy points based on face cards AND suit shortages
 * Dummy earns base points from face cards (same as Declarer: A=4, K=3, Q=2, J=1)
 * Dummy earns additional points for shortages in suits OTHER THAN TRUMP (HEARTS):
 * - 2 cards in a suit = 1 point
 * - 1 card in a suit = 3 points  
 * - 0 cards in a suit (void) = 5 points
 */
export function calculateDummyPoints(hand: Card[]): number {
	const basePoints = calculateHandPoints(hand); // Face card points
	const suits: Suit[] = ['diamonds', 'clubs', 'spades']; // Exclude hearts (trump)
	let shortagePoints = 0;
	
	for (const suit of suits) {
		const suitCount = countSuitCards(hand, suit);
		switch (suitCount) {
			case 0: // void
				shortagePoints += 5;
				break;
			case 1: // singleton
				shortagePoints += 3;
				break;
			case 2: // doubleton
				shortagePoints += 1;
				break;
			// 3+ cards in a suit = 0 points
		}
	}
	
	return basePoints + shortagePoints;
}

/**
 * Validate partnership requirements
 * Declarer points + Dummy points must add to at least 23 AND no more than 28
 */
export function validatePartnershipPoints(declarerPoints: number, dummyPoints: number): boolean {
	const total = declarerPoints + dummyPoints;
	return total >= 23 && total <= 28;
}

/**
 * Validate a complete deal according to all bridge rules
 */
export function validateDeal(declarerHand: Card[], dummyHand: Card[]): {
	isValid: boolean;
	declarerPoints: number;
	dummyPoints: number;
	totalPoints: number;
	errors: string[];
} {
	const errors: string[] = [];
	let declarerPoints = 0;
	let dummyPoints = 0;
	
	try {
		declarerPoints = calculateDeclarerPoints(declarerHand);
	} catch (error) {
		errors.push(error instanceof Error ? error.message : 'Declarer hand validation failed');
	}
	
	dummyPoints = calculateDummyPoints(dummyHand);
	
	const totalPoints = declarerPoints + dummyPoints;
	
	if (!validatePartnershipPoints(declarerPoints, dummyPoints)) {
		errors.push(`Partnership points (${totalPoints}) must be between 23 and 28`);
	}
	
	return {
		isValid: errors.length === 0,
		declarerPoints,
		dummyPoints,
		totalPoints,
		errors
	};
}
