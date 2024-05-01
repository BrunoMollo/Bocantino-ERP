ALTER TABLE "entry_document" DROP CONSTRAINT "entry_document_type_id_document_type_id_fk";
--> statement-breakpoint
ALTER TABLE "entry_document" ALTER COLUMN "type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_document" ADD COLUMN "document_type" text;

-- Hand made queries
UPDATE "entry_document" 
SET "document_type" = "document_type"."description"
FROM "document_type" 
WHERE "entry_document"."type_id" = "document_type"."id";

SELECT ed.id, ed.type_id, ed.document_type, dt.description FROM 
entry_document ed
INNER JOIN document_type dt
ON ed.type_id=dt.id

ALTER TABLE "entry_document" ALTER COLUMN "document_type" SET NOT NULL;

DROP TABLE "document_type";--> statement-breakpoint
