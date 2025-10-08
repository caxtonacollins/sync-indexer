CREATE TABLE IF NOT EXISTS "cursor_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"end_cursor" bigint,
	"unique_key" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "liquidity_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_number" bigint,
	"transaction_hash" text,
	"event_index" bigint,
	"contract_address" text,
	"keys" json,
	"data" json,
	"created_at" timestamp DEFAULT now()
);
