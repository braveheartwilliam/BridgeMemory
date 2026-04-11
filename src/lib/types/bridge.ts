export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
	suit: Suit;
	rank: Rank;
	id: string;
}

export interface CardComponentProps {
	card: Card;
	size?: 'small' | 'medium' | 'large';
	clickable?: boolean;
	onClick?: (card: Card) => void;
	flipped?: boolean;
	bridgeTheme?: boolean;
	showBack?: boolean; // Added for Bridge Play Analysis
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
	validation?: {
		isValid: boolean;
		declarerPoints: number;
		dummyPoints: number;
		totalPoints: number;
		errors: string[];
	};
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface RobotPlayer extends Player {
	skillLevel: SkillLevel;
}
