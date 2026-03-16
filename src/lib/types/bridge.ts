export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
	suit: Suit;
	rank: Rank;
}

export interface Player {
	id: number;
	name: string;
	hand: Card[];
	isHuman: boolean;
}

export interface GameState {
	players: Player[];
	currentPlayer: number;
	trick: Card[];
	trickWinner: number | null;
	trickNumber: number;
	deck: Card[];
	playedCards: Card[];
	isGameOver: boolean;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface RobotPlayer extends Player {
	skillLevel: SkillLevel;
}
