ALTER TABLE "entry_document" ADD COLUMN "creation_date" timestamp;--> statement-breakpoint
ALTER TABLE "product_batch" ADD COLUMN "creation_date" timestamp;--> statement-breakpoint
ALTER TABLE "r_ingredient_batch_ingredient_batch" ADD COLUMN "creation_date" timestamp;--> statement-breakpoint
ALTER TABLE "r_product_batch_ingredient_batch" ADD COLUMN "creation_date" timestamp;