import { DatabaseService } from '$lib/db';
import type { GameSession, CardHand, Trick } from '$lib/db';

export interface GameState {
  session: GameSession;
  hands: CardHand[];
  tricks: Trick[];
  currentTrick: number;
  currentPlayer: string;
  gamePhase: 'setup' | 'playing' | 'completed';
}

export interface Card {
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  rank: 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
}

export interface Player {
  id: string;
  name: string;
  position: 'north' | 'south' | 'east' | 'west';
  hand: Card[];
  isDeclarer: boolean;
  isDummy: boolean;
}

/**
 * Game State Service
 * Manages persistent game state using the database
 */
export class GameStateService {
  /**
   * Initialize a new game session
   */
  async initializeGame(
    userId: number,
    gameMode: string,
    selectedPlayers: string,
    options: {
      contractLevel?: string;
      declarerPosition?: string;
    } = {}
  ): Promise<GameState> {
    // Create game session
    const session = await DatabaseService.createGameSession({
      userId,
      gameMode,
      selectedPlayers,
      contractLevel: options.contractLevel,
      declarerPosition: options.declarerPosition,
      status: 'active'
    });

    // Generate and deal cards
    const hands = await this.dealCards(session.id, selectedPlayers);

    // Initialize game state
    const gameState: GameState = {
      session,
      hands,
      tricks: [],
      currentTrick: 0,
      currentPlayer: this.determineStartingPlayer(selectedPlayers),
      gamePhase: 'setup'
    };

    return gameState;
  }

  /**
   * Save game state to database
   */
  async saveGameState(gameState: GameState): Promise<void> {
    // Update session
    await DatabaseService.updateGameSession(gameState.session.id, {
      status: gameState.gamePhase === 'completed' ? 'completed' : 'active',
      totalTricks: gameState.tricks.length,
      declarerTricks: this.calculateDeclarerTricks(gameState),
      opponentsTricks: this.calculateOpponentTricks(gameState),
      gameData: {
        currentTrick: gameState.currentTrick,
        currentPlayer: gameState.currentPlayer,
        gamePhase: gameState.gamePhase
      }
    });

    // Save hands if they've changed
    for (const hand of gameState.hands) {
      await DatabaseService.updateCardHand(hand.id, {
        cards: hand.cards as Card[],
        handPoints: this.calculateHandPoints(hand.cards as Card[])
      });
    }

    // Save tricks
    for (const trick of gameState.tricks) {
      if (!trick.id) {
        await DatabaseService.createTrick({
          sessionId: gameState.session.id,
          trickNumber: trick.trickNumber,
          leadPlayer: trick.leadPlayer,
          cards: trick.cards,
          winner: trick.winner,
          trumpSuit: trick.trumpSuit,
          leadSuit: trick.leadSuit
        });
      }
    }
  }

  /**
   * Load game state from database
   */
  async loadGameState(sessionId: number): Promise<GameState | null> {
    const session = await DatabaseService.getGameSessionById(sessionId);
    if (!session) return null;

    const hands = await DatabaseService.getGameSessionHands(sessionId);
    const tricks = await DatabaseService.getGameSessionTricks(sessionId);

    const gameData = session.gameData as any;
    
    return {
      session,
      hands,
      tricks,
      currentTrick: gameData?.currentTrick || 0,
      currentPlayer: gameData?.currentPlayer || 'north',
      gamePhase: gameData?.gamePhase || 'setup'
    };
  }

  /**
   * Deal cards for a new game
   */
  private async dealCards(sessionId: number, selectedPlayers: string): Promise<CardHand[]> {
    const deck = this.generateDeck();
    const shuffledDeck = this.shuffleDeck(deck);
    
    const hands: CardHand[] = [];
    const players = this.getPlayers(selectedPlayers);
    
    // Deal 13 cards to each player
    let cardIndex = 0;
    for (const player of players) {
      const playerCards = shuffledDeck.slice(cardIndex, cardIndex + 13);
      cardIndex += 13;

      const hand = await DatabaseService.createCardHand({
        sessionId,
        player: player.position,
        cards: playerCards,
        handPoints: this.calculateHandPoints(playerCards),
        isDeclarer: player.isDeclarer,
        isDummy: player.isDummy
      });

      hands.push(hand);
    }

    return hands;
  }

  /**
   * Generate a standard 52-card deck
   */
  private generateDeck(): Card[] {
    const suits: Card['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const ranks: Card['rank'][] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    const deck: Card[] = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return deck;
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * Get players based on selected players option
   */
  private getPlayers(selectedPlayers: string): Player[] {
    if (selectedPlayers === 'specific') {
      // Four hands (declarer and dummy face-up)
      return [
        { id: '1', name: 'North', position: 'north', hand: [], isDeclarer: false, isDummy: false },
        { id: '2', name: 'South (Declarer)', position: 'south', hand: [], isDeclarer: true, isDummy: false },
        { id: '3', name: 'East', position: 'east', hand: [], isDeclarer: false, isDummy: false },
        { id: '4', name: 'West (Dummy)', position: 'west', hand: [], isDeclarer: false, isDummy: true }
      ];
    }
    
    // Default: random selection
    return [
      { id: '1', name: 'North', position: 'north', hand: [], isDeclarer: false, isDummy: false },
      { id: '2', name: 'East', position: 'east', hand: [], isDeclarer: false, isDummy: false },
      { id: '3', name: 'South', position: 'south', hand: [], isDeclarer: true, isDummy: false },
      { id: '4', name: 'West', position: 'west', hand: [], isDeclarer: false, isDummy: false }
    ];
  }

  /**
   * Determine starting player
   */
  private determineStartingPlayer(selectedPlayers: string): string {
    // In bridge, the player to the left of declarer leads first
    return 'west'; // Simplified - would depend on declarer position
  }

  /**
   * Calculate hand points (High Card Points + distribution)
   */
  private calculateHandPoints(cards: Card[]): number {
    const highCardPoints = cards.reduce((total, card) => {
      switch (card.rank) {
        case 'A': return total + 4;
        case 'K': return total + 3;
        case 'Q': return total + 2;
        case 'J': return total + 1;
        default: return total;
      }
    }, 0);

    // Add distribution points (simplified)
    const suitCounts = cards.reduce((acc, card) => {
      acc[card.suit] = (acc[card.suit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distributionPoints = Object.values(suitCounts).reduce((total, count) => {
      if (count === 0) return total + 3; // Void
      if (count === 1) return total + 2; // Singleton
      if (count === 2) return total + 1; // Doubleton
      return total;
    }, 0);

    return highCardPoints + distributionPoints;
  }

  /**
   * Calculate declarer tricks won
   */
  private calculateDeclarerTricks(gameState: GameState): number {
    return gameState.tricks.filter(trick => 
      trick.winner === 'north' || trick.winner === 'south'
    ).length;
  }

  /**
   * Calculate opponent tricks won
   */
  private calculateOpponentTricks(gameState: GameState): number {
    return gameState.tricks.filter(trick => 
      trick.winner === 'east' || trick.winner === 'west'
    ).length;
  }

  /**
   * Complete the game
   */
  async completeGame(sessionId: number, finalScore: number): Promise<void> {
    await DatabaseService.updateGameSession(sessionId, {
      status: 'completed',
      completedAt: new Date()
    });

    // Record game statistics
    const session = await DatabaseService.getGameSessionById(sessionId);
    if (session) {
      await DatabaseService.createGameStatistics({
        userId: session.userId,
        sessionId,
        gameMode: session.gameMode,
        score: finalScore,
        difficulty: 'medium',
        accuracy: Math.max(0, Math.min(100, finalScore)),
        speed: 0, // Would be calculated based on game duration
        hintsUsed: 0,
        mistakes: 0
      });
    }
  }
}