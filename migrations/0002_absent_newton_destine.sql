ALTER TABLE "projects" ADD COLUMN "analysis_type" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "analysis_field" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "custom_analysis_field" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "terms_accepted" boolean DEFAULT false;