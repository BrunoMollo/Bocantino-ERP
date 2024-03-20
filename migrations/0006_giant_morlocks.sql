ALTER TABLE "ingridient_entry" DROP CONSTRAINT "ingridient_entry_document_id_entry_document_id_fk";
--> statement-breakpoint
ALTER TABLE "entry_document" ADD COLUMN "entry_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "entry_document" ADD CONSTRAINT "entry_document_entry_id_ingridient_entry_id_fk" FOREIGN KEY ("entry_id") REFERENCES "ingridient_entry"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "ingridient_entry" DROP COLUMN IF EXISTS "document_id";