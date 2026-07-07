CREATE TYPE "public"."tone" AS ENUM('formal', 'casual', 'friendly');--> statement-breakpoint
CREATE TABLE "favorite_expressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"daily_log_id" uuid,
	"korean_text" text NOT NULL,
	"english_text" text NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "daily_logs" ADD COLUMN "tone" "tone";--> statement-breakpoint
ALTER TABLE "favorite_expressions" ADD CONSTRAINT "favorite_expressions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorite_expressions" ADD CONSTRAINT "favorite_expressions_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fav_expr_user_id_idx" ON "favorite_expressions" USING btree ("user_id");