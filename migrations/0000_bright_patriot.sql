CREATE TABLE IF NOT EXISTS "document_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entry_document" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_identifier" text NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"type_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"reorder_point" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredient_batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_bag_code" text NOT NULL,
	"full_amount" real NOT NULL,
	"production_date" date,
	"ingredient_id" integer NOT NULL,
	"amount_of_bags" integer NOT NULL,
	"state" text NOT NULL,
	"registration_date" timestamp NOT NULL,
	"supplier_id" integer,
	"expiration_date" date,
	"cost" integer,
	"currency_alpha_code" varchar(4) NOT NULL,
	"entry_id" integer,
	"iva_tax_percentage" real NOT NULL,
	"perceptions_tax_amount" real NOT NULL,
	"adjustment" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingridient_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"creation_date" timestamp NOT NULL,
	"total_cost" integer,
	"currency_alpha_code" varchar(4) NOT NULL,
	"document_id" integer,
	"supplier_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"desc" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_bag_code" text NOT NULL,
	"full_amount" real NOT NULL,
	"expiration_date" date NOT NULL,
	"production_date" date,
	"product_id" integer NOT NULL,
	"state" text NOT NULL,
	"registration_date" timestamp NOT NULL,
	"adjustment" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cuit" text NOT NULL,
	"phone_number" text NOT NULL,
	"address" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r_ingredient_batch_ingredient_batch" (
	"id" serial NOT NULL,
	"produced_batch_id" integer NOT NULL,
	"used_batch_id" integer NOT NULL,
	"amount_used" real NOT NULL,
	CONSTRAINT r_ingredient_batch_ingredient_batch_produced_batch_id_used_batch_id_pk PRIMARY KEY("produced_batch_id","used_batch_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r_ingredient_ingredient" (
	"id" serial NOT NULL,
	"amount" real NOT NULL,
	"derived_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	CONSTRAINT r_ingredient_ingredient_derived_id_source_id_pk PRIMARY KEY("derived_id","source_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r_ingredient_product" (
	"id" serial NOT NULL,
	"ingredient_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"amount" real NOT NULL,
	CONSTRAINT r_ingredient_product_ingredient_id_product_id_pk PRIMARY KEY("ingredient_id","product_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r_product_batch_ingredient_batch" (
	"id" serial NOT NULL,
	"product_batch_id" integer NOT NULL,
	"ingredient_batch_id" integer NOT NULL,
	"amount_used" real NOT NULL,
	CONSTRAINT r_product_batch_ingredient_batch_product_batch_id_ingredient_batch_id_pk PRIMARY KEY("product_batch_id","ingredient_batch_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "r_supplier_ingredient" (
	"id" serial NOT NULL,
	"supplier_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT r_supplier_ingredient_supplier_id_ingredient_id_pk PRIMARY KEY("supplier_id","ingredient_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entry_document" ADD CONSTRAINT "entry_document_type_id_document_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "document_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredient_batch" ADD CONSTRAINT "ingredient_batch_ingredient_id_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredient_batch" ADD CONSTRAINT "ingredient_batch_entry_id_ingridient_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "ingridient_entry"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredient_batch" ADD CONSTRAINT "ingredient_batch_supplier_id_ingredient_id_r_supplier_ingredient_supplier_id_ingredient_id_fk" FOREIGN KEY ("supplier_id","ingredient_id") REFERENCES "r_supplier_ingredient"("supplier_id","ingredient_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingridient_entry" ADD CONSTRAINT "ingridient_entry_document_id_entry_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "entry_document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingridient_entry" ADD CONSTRAINT "ingridient_entry_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_batch" ADD CONSTRAINT "product_batch_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_batch_ingredient_batch" ADD CONSTRAINT "r_ingredient_batch_ingredient_batch_produced_batch_id_ingredient_batch_id_fk" FOREIGN KEY ("produced_batch_id") REFERENCES "ingredient_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_batch_ingredient_batch" ADD CONSTRAINT "r_ingredient_batch_ingredient_batch_used_batch_id_ingredient_batch_id_fk" FOREIGN KEY ("used_batch_id") REFERENCES "ingredient_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_ingredient" ADD CONSTRAINT "r_ingredient_ingredient_derived_id_ingredient_id_fk" FOREIGN KEY ("derived_id") REFERENCES "ingredient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_ingredient" ADD CONSTRAINT "r_ingredient_ingredient_source_id_ingredient_id_fk" FOREIGN KEY ("source_id") REFERENCES "ingredient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_product" ADD CONSTRAINT "r_ingredient_product_ingredient_id_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_ingredient_product" ADD CONSTRAINT "r_ingredient_product_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_product_batch_ingredient_batch" ADD CONSTRAINT "r_product_batch_ingredient_batch_product_batch_id_product_batch_id_fk" FOREIGN KEY ("product_batch_id") REFERENCES "product_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_product_batch_ingredient_batch" ADD CONSTRAINT "r_product_batch_ingredient_batch_ingredient_batch_id_ingredient_batch_id_fk" FOREIGN KEY ("ingredient_batch_id") REFERENCES "ingredient_batch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_supplier_ingredient" ADD CONSTRAINT "r_supplier_ingredient_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "r_supplier_ingredient" ADD CONSTRAINT "r_supplier_ingredient_ingredient_id_ingredient_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "ingredient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
