import { z } from 'zod';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Game session validation schemas
export const gameSessionSchema = z.object({
  gameMode: z.enum(['manual', 'automated', 'played-card']),
  selectedPlayers: z.enum(['random', 'specific']),
  contractLevel: z.string().optional(),
  declarerPosition: z.enum(['north', 'south', 'east', 'west']).optional()
});

// Card game validation schemas
export const cardPlaySchema = z.object({
  cardId: z.string().min(1, 'Please select a card'),
  playerId: z.string().min(1, 'Player ID is required'),
  trickId: z.string().optional()
});

// Bridge-specific validation schemas
export const bridgeHandSchema = z.object({
  hand: z.array(z.object({
    suit: z.enum(['spades', 'hearts', 'diamonds', 'clubs']),
    rank: z.enum(['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'])
  })).length(13, 'A bridge hand must have exactly 13 cards'),
  isDeclarer: z.boolean().default(false),
  isDummy: z.boolean().default(false)
});

export const contractSchema = z.object({
  level: z.number().min(1).max(7, 'Contract level must be between 1 and 7'),
  suit: z.enum(['clubs', 'diamonds', 'hearts', 'spades', 'nt']),
  declarer: z.enum(['north', 'south', 'east', 'west']),
  vulnerability: z.enum(['none', 'ns', 'ew', 'both']).default('none')
});

// Statistics validation schemas
export const gameStatisticsSchema = z.object({
  accuracy: z.number().min(0).max(100, 'Accuracy must be between 0 and 100'),
  speed: z.number().min(0, 'Speed must be a positive number'),
  hintsUsed: z.number().min(0, 'Hints used must be non-negative'),
  mistakes: z.number().min(0, 'Mistakes must be non-negative'),
  score: z.number().min(0, 'Score must be non-negative'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert'])
});

// User preferences validation schemas
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  soundEnabled: z.boolean().default(true),
  animationsEnabled: z.boolean().default(true),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  language: z.enum(['en', 'es', 'fr', 'de', 'it', 'pt']).default('en'),
  notifications: z.boolean().default(true),
  autoSave: z.boolean().default(true)
});

// Form validation helper functions
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: { _form: 'Validation failed' }
    };
  }
}

// Type exports
export type UserInput = z.infer<typeof userSchema>;
export type GameSessionInput = z.infer<typeof gameSessionSchema>;
export type CardPlayInput = z.infer<typeof cardPlaySchema>;
export type BridgeHandInput = z.infer<typeof bridgeHandSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type GameStatisticsInput = z.infer<typeof gameStatisticsSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;