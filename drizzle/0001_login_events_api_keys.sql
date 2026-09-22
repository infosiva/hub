CREATE TABLE IF NOT EXISTS "login_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project" text NOT NULL,
	"user_email" text,
	"event" text DEFAULT 'login' NOT NULL,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_key_registry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project" text NOT NULL,
	"provider" text NOT NULL,
	"env_var_name" text NOT NULL,
	"masked_value" text,
	"notes" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_events_project_idx" ON "login_events" ("project");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "login_events_created_at_idx" ON "login_events" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_registry_project_idx" ON "api_key_registry" ("project");
