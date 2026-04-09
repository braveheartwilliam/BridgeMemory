import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

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