import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load env from root, then blog-core/.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "packages/blog-core/.env") });

const prisma = new PrismaClient();

async function run() {
  try {
    // Create extensions if missing
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
          CREATE EXTENSION pg_trgm;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
          CREATE EXTENSION unaccent;
        END IF;
      END$$;
    `);

    // Add search_vector column if not exists
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='Article' AND column_name='search_vector'
        ) THEN
          ALTER TABLE "Article" ADD COLUMN search_vector tsvector;
        END IF;
      END $$;
    `);

    // Populate, trigger, index
    await prisma.$executeRawUnsafe(`
      UPDATE "Article"
      SET search_vector = to_tsvector('italian', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,''));

      CREATE OR REPLACE FUNCTION article_tsvector_update() RETURNS trigger AS $$
      begin
        new.search_vector :=
          to_tsvector('italian', coalesce(new.title,'') || ' ' || coalesce(new.excerpt,'') || ' ' || coalesce(new.content,''));
        return new;
      end
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS article_tsvector_trigger ON "Article";
      CREATE TRIGGER article_tsvector_trigger BEFORE INSERT OR UPDATE
      ON "Article" FOR EACH ROW EXECUTE PROCEDURE article_tsvector_update();

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname = 'article_search_gin'
        ) THEN
          CREATE INDEX article_search_gin ON "Article" USING GIN (search_vector);
        END IF;
      END $$;
    `);

    console.log("Post-migration: full-text search setup complete.");
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
