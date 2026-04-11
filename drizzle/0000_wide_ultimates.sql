CREATE TABLE "card_hands" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"player" text NOT NULL,
	"cards" json NOT NULL,
	"hand_points" integer DEFAULT 0,
	"is_declarer" boolean DEFAULT false,
	"is_dummy" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"game_mode" text NOT NULL,
	"selected_players" text NOT NULL,
	"contract_level" text,
	"declarer_position" text,
	"status" text DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"total_tricks" integer DEFAULT 0,
	"declarer_tricks" integer DEFAULT 0,
	"opponents_tricks" integer DEFAULT 0,
	"game_data" json
);
--> statement-breakpoint
CREATE TABLE "game_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" integer,
	"game_mode" text NOT NULL,
	"accuracy" integer,
	"speed" integer,
	"hints_used" integer DEFAULT 0,
	"mistakes" integer DEFAULT 0,
	"score" integer DEFAULT 0,
	"difficulty" text DEFAULT 'medium',
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tricks" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"trick_number" integer NOT NULL,
	"lead_player" text NOT NULL,
	"cards" json NOT NULL,
	"winner" text NOT NULL,
	"trump_suit" text,
	"lead_suit" text,
	"played_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"theme" text DEFAULT 'light',
	"sound_enabled" boolean DEFAULT true,
	"animations_enabled" boolean DEFAULT true,
	"difficulty" text DEFAULT 'medium',
	"language" text DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "card_hands" ADD CONSTRAINT "card_hands_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_statistics" ADD CONSTRAINT "game_statistics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_statistics" ADD CONSTRAINT "game_statistics_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tricks" ADD CONSTRAINT "tricks_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;