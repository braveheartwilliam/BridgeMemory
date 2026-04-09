# Database Migration: Initial Schema

-- Migration: 001_initial_schema
-- Description: Create initial database schema for Bridge Strategies Challenge

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    game_mode TEXT NOT NULL,
    selected_players TEXT NOT NULL,
    contract_level TEXT,
    declarer_position TEXT,
    status TEXT DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_tricks INTEGER DEFAULT 0,
    declarer_tricks INTEGER DEFAULT 0,
    opponents_tricks INTEGER DEFAULT 0,
    game_data JSON
);

-- Create card_hands table
CREATE TABLE IF NOT EXISTS card_hands (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES game_sessions(id),
    player TEXT NOT NULL,
    cards JSON NOT NULL,
    hand_points INTEGER DEFAULT 0,
    is_declarer BOOLEAN DEFAULT false,
    is_dummy BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tricks table
CREATE TABLE IF NOT EXISTS tricks (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES game_sessions(id),
    trick_number INTEGER NOT NULL,
    lead_player TEXT NOT NULL,
    cards JSON NOT NULL,
    winner TEXT NOT NULL,
    trump_suit TEXT,
    lead_suit TEXT,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_statistics table
CREATE TABLE IF NOT EXISTS game_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    session_id INTEGER REFERENCES game_sessions(id),
    game_mode TEXT NOT NULL,
    accuracy INTEGER,
    speed INTEGER,
    hints_used INTEGER DEFAULT 0,
    mistakes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'medium',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    theme TEXT DEFAULT 'light',
    sound_enabled BOOLEAN DEFAULT true,
    animations_enabled BOOLEAN DEFAULT true,
    difficulty TEXT DEFAULT 'medium',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_card_hands_session_id ON card_hands(session_id);
CREATE INDEX IF NOT EXISTS idx_tricks_session_id ON tricks(session_id);
CREATE INDEX IF NOT EXISTS idx_game_statistics_user_id ON game_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role) 
VALUES ('admin@bridge-strategies.com', 'Admin User', '$2b$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;