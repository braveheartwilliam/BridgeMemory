# Database Schema Implementation

## Files to Copy

### 1. src/lib/db/schema.ts
```typescript
import { pgTable, text, integer, timestamp, boolean, json, serial } from 'drizzle-orm/pg-core';

// Users table for authentication and user management
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Game sessions table for tracking game instances
export const gameSessions = pgTable('game_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  gameMode: text('game_mode').notNull(), // 'manual', 'automated', 'played-card'
  selectedPlayers: text('selected_players').notNull(), // 'random', 'specific'
  contractLevel: text('contract_level'),
  declarerPosition: text('declarer_position'),
  status: text('status').default('active'), // 'active', 'completed', 'abandoned'
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  totalTricks: integer('total_tricks').default(0),
  declarerTricks: integer('declarer_tricks').default(0),
  opponentsTricks: integer('opponents_tricks').default(0),
  gameData: json('game_data') // Store complex game state
});

// Card hands table for tracking player hands
export const cardHands = pgTable('card_hands', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => gameSessions.id),
  player: text('player').notNull(), // 'north', 'south', 'east', 'west'
  cards: json('cards').notNull(), // Array of card objects
  handPoints: integer('hand_points').default(0),
  isDeclarer: boolean('is_declarer').default(false),
  isDummy: boolean('is_dummy').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// Tricks table for tracking individual tricks
export const tricks = pgTable('tricks', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => gameSessions.id),
  trickNumber: integer('trick_number').notNull(),
  leadPlayer: text('lead_player').notNull(),
  cards: json('cards').notNull(), // Array of cards played in this trick
  winner: text('winner').notNull(), // Which player won the trick
  trumpSuit: text('trump_suit'), // Trump suit for this trick
  leadSuit: text('lead_suit'), // Lead suit for this trick
  playedAt: timestamp('played_at').defaultNow()
});

// Game statistics table for tracking performance
export const gameStatistics = pgTable('game_statistics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: integer('session_id').references(() => gameSessions.id),
  gameMode: text('game_mode').notNull(),
  accuracy: integer('accuracy'), // Percentage of correct plays
  speed: integer('speed'), // Average time per decision
  hintsUsed: integer('hints_used').default(0),
  mistakes: integer('mistakes').default(0),
  score: integer('score').default(0),
  difficulty: text('difficulty').default('medium'),
  completedAt: timestamp('completed_at').defaultNow()
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  theme: text('theme').default('light'),
  soundEnabled: boolean('sound_enabled').default(true),
  animationsEnabled: boolean('animations_enabled').default(true),
  difficulty: text('difficulty').default('medium'),
  language: text('language').default('en'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type CardHand = typeof cardHands.$inferSelect;
export type NewCardHand = typeof cardHands.$inferInsert;
export type Trick = typeof tricks.$inferSelect;
export type NewTrick = typeof tricks.$inferInsert;
export type GameStatistics = typeof gameStatistics.$inferSelect;
export type NewGameStatistics = typeof gameStatistics.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
```

### 2. src/lib/db/index.ts
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq, desc } from 'drizzle-orm';

// Database connection configuration
const connectionString = process.env.DATABASE_URL || 
  'postgresql://username:password@localhost:5432/bridge_strategies';

// Create postgres client
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Idle timeout in seconds
  connect_timeout: 10, // Connect timeout in seconds
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Export schema for easy access
export * from './schema';

// Database helper functions
export async function getDatabaseConnection() {
  try {
    // Test connection
    await client`SELECT 1`;
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { success: false, message: 'Database connection failed', error };
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

// Query helpers
export class DatabaseService {
  // User operations
  static async createUser(userData: schema.NewUser) {
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  }

  static async getUserById(id: number) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || null;
  }

  static async getUserByEmail(email: string) {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || null;
  }

  // Game session operations
  static async createGameSession(sessionData: schema.NewGameSession) {
    const [session] = await db.insert(schema.gameSessions).values(sessionData).returning();
    return session;
  }

  static async getGameSessionById(id: number) {
    const [session] = await db.select().from(schema.gameSessions).where(eq(schema.gameSessions.id, id));
    return session || null;
  }

  static async getUserGameSessions(userId: number) {
    return await db.select()
      .from(schema.gameSessions)
      .where(eq(schema.gameSessions.userId, userId))
      .orderBy(desc(schema.gameSessions.createdAt));
  }

  // Card hand operations
  static async createCardHand(handData: schema.NewCardHand) {
    const [hand] = await db.insert(schema.cardHands).values(handData).returning();
    return hand;
  }

  static async getGameSessionHands(sessionId: number) {
    return await db.select()
      .from(schema.cardHands)
      .where(eq(schema.cardHands.sessionId, sessionId));
  }

  // Trick operations
  static async createTrick(trickData: schema.NewTrick) {
    const [trick] = await db.insert(schema.tricks).values(trickData).returning();
    return trick;
  }

  static async getGameSessionTricks(sessionId: number) {
    return await db.select()
      .from(schema.tricks)
      .where(eq(schema.tricks.sessionId, sessionId))
      .orderBy(schema.tricks.trickNumber);
  }

  // Statistics operations
  static async createGameStatistics(statsData: schema.NewGameStatistics) {
    const [stats] = await db.insert(schema.gameStatistics).values(statsData).returning();
    return stats;
  }

  static async getUserStatistics(userId: number) {
    return await db.select()
      .from(schema.gameStatistics)
      .where(eq(schema.gameStatistics.userId, userId))
      .orderBy(desc(schema.gameStatistics.completedAt))
      .limit(50);
  }

  // User preferences operations
  static async createUserPreferences(prefsData: schema.NewUserPreferences) {
    const [prefs] = await db.insert(schema.userPreferences).values(prefsData).returning();
    return prefs;
  }

  static async getUserPreferences(userId: number) {
    const [prefs] = await db.select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId));
    return prefs || null;
  }

  static async updateUserPreferences(userId: number, prefsData: Partial<schema.NewUserPreferences>) {
    const [prefs] = await db.update(schema.userPreferences)
      .set(prefsData)
      .where(eq(schema.userPreferences.userId, userId))
      .returning();
    return prefs;
  }
}

// Export database instance for direct queries
export default db;
```

### 3. drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/bridge_strategies',
  },
  verbose: true,
  strict: true,
});
```

### 4. src/lib/services/game-state-service.ts
```typescript
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
        cards: hand.cards,
        handPoints: this.calculateHandPoints(hand.cards)
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
```

## Installation Instructions

1. Create directories:
```bash
mkdir -p src/lib/db
mkdir -p src/lib/services
mkdir -p src/lib/tests
mkdir -p drizzle
```

2. Install dependencies:
```bash
npm install drizzle-orm postgres @types/pg
npm install -D drizzle-kit
```

3. Copy the files above to their respective locations

4. Create environment file:
```bash
cp .env.example .env.local
```

5. Update .env.local with your database connection string