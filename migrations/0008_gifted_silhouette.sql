ALTER TABLE "entry_document" DROP CONSTRAINT "entry_document_type_id_document_type_id_fk";
--> statement-breakpoint
ALTER TABLE "entry_document" ALTER COLUMN "type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_document" ADD COLUMN "document_type" text NOT NULL;
DROP TABLE "document_type";--> statement-breakpoint
