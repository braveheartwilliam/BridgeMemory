// Common type definitions for Bridge Memory application

export interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  rank: 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
  id: string;
}

export interface PlayerHand {
  cards: Card[];
  tricks: number;
}

export interface GameSession {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxPlayers: number;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface GameState {
  currentTrick: number;
  totalTricks: number;
  gamePhase: 'setup' | 'playing' | 'completed';
  playerHand: PlayerHand;
  opponentHand: PlayerHand;
  currentPlayer: 'north' | 'south' | 'east' | 'west';
  trickWinner?: 'north' | 'south' | 'east' | 'west';
  gameCompleted: boolean;
}

export interface CardComponentProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  clickable?: boolean;
  onclick?: (card: Card) => void;
  onkeydown?: (e: KeyboardEvent) => void;
  flipped?: boolean;
  bridgeTheme?: boolean;
  showBack?: boolean;
}

export interface AnalysisResult {
  play: string;
  reasoning: string;
  probability?: number;
  successRate?: string;
}

export interface TrickResult {
  winner: 'north' | 'south' | 'east' | 'west';
  cards: Card[];
  isWinner: boolean;
}

// Common card display functions
export function getCardColor(card: Card): string {
  return (card.suit === 'hearts' || card.suit === 'diamonds') ? 'text-red-600' : 'text-black';
}

export function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    default: return '♠';
  }
}

export function getRankDisplay(rank: string): string {
  switch (rank) {
    case 'A': return 'A';
    case 'K': return 'K';
    case 'Q': return 'Q';
    case 'J': return 'J';
    case '10': return '10';
    case '9': return '9';
    case '8': return '8';
    case '7': return '7';
    case '6': return '6';
    case '5': return '5';
    case '4': return '4';
    case '3': return '3';
    case '2': return '2';
    default: return rank;
  }
}

export function getCardDescription(card: Card): string {
  return `${card.rank} of ${card.suit}`;
}

export function parseCardId(id: string): Card {
  const [suit, rank] = id.split('-');
  return {
    suit: suit as Card['suit'],
    rank: rank as Card['rank'],
    id: id
  };
}

// Common constants
export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
