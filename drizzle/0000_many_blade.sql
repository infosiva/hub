CREATE TABLE "access_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"project" text,
	"days_unlocked" integer NOT NULL,
	"feature" text DEFAULT 'pro' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "access_codes_code_unique" UNIQUE("code")
);
