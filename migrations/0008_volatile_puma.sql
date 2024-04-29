ALTER TABLE "ingredient" ALTER COLUMN "reorder_point" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "protein" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "carbs" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "fats" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "humidity" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "fiber" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "ashes" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "calcium" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "sodium" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient" ALTER COLUMN "phosphorus" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "ingredient_batch" ALTER COLUMN "full_amount" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "ingredient_batch" ALTER COLUMN "cost" SET DATA TYPE decimal(100, 2);--> statement-breakpoint
ALTER TABLE "ingredient_batch" ALTER COLUMN "iva_tax_percentage" SET DATA TYPE decimal(10, 2);--> statement-breakpoint
ALTER TABLE "ingredient_batch" ALTER COLUMN "withdrawal_tax_amount" SET DATA TYPE decimal(10, 2);--> statement-breakpoint
ALTER TABLE "ingredient_batch" ALTER COLUMN "adjustment" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "ingridient_entry" ALTER COLUMN "total_cost" SET DATA TYPE decimal(100, 2);--> statement-breakpoint
ALTER TABLE "product_batch" ALTER COLUMN "full_amount" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "product_batch" ALTER COLUMN "adjustment" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "r_ingredient_batch_ingredient_batch" ALTER COLUMN "amount_used" SET DATA TYPE decimal(100, 3);--> statement-breakpoint
ALTER TABLE "r_ingredient_ingredient" ALTER COLUMN "amount" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "r_ingredient_product" ALTER COLUMN "amount" SET DATA TYPE decimal(100, 10);--> statement-breakpoint
ALTER TABLE "r_product_batch_ingredient_batch" ALTER COLUMN "amount_used" SET DATA TYPE decimal(100, 3);