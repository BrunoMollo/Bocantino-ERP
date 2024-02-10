ALTER TABLE "user" RENAME TO "app_user";--> statement-breakpoint
ALTER TABLE "app_user" DROP CONSTRAINT "user_username_unique";--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_username_unique" UNIQUE("username");