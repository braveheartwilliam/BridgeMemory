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