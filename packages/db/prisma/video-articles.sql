-- Video Article CMS — migration for the existing public.Video table.
-- Adds the article content fields, performance indexes, and RLS.
-- Run against the Supabase direct connection:
--   psql "$DIRECT_URL" -f video-articles.sql
-- (Idempotent — safe to re-run.)

-- 1) Columns ---------------------------------------------------------------
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "content" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "layout" TEXT NOT NULL DEFAULT 'video-first';

-- 2) Backfill slugs for existing rows (cuid ids are unique → prefixing is unique)
UPDATE "Video"
SET "slug" = 'video-' || id
WHERE "slug" IS NULL;

-- 3) Unique index on slug (drives the detail-page lookup) ------------------
CREATE UNIQUE INDEX IF NOT EXISTS "Video_slug_key" ON "Video" ("slug");

-- 4) Performance indexes ---------------------------------------------------
-- Feed sorts by (published, sortOrder, createdAt) for the paginated list.
CREATE INDEX IF NOT EXISTS "Video_published_sortOrder_idx" ON "Video" ("published", "sortOrder");
CREATE INDEX IF NOT EXISTS "Video_createdAt_idx" ON "Video" ("createdAt");
CREATE INDEX IF NOT EXISTS "Video_categoryId_idx" ON "Video" ("categoryId");

-- 5) Row Level Security ----------------------------------------------------
-- The app connects as the table owner (Prisma service role), which bypasses
-- RLS — so these policies do not disturb the running site. They exist to
-- bound *direct* Postgres access: unauthenticated / anon clients can only
-- read published rows; only authenticated admin roles can write.
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_articles_public_read" ON "Video";
CREATE POLICY "video_articles_public_read"
  ON "Video" FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "video_articles_admin_write" ON "Video";
CREATE POLICY "video_articles_admin_write"
  ON "Video" FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin'
      OR current_user IN ('postgres', 'service_role', 'supabase_admin')
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin'
      OR current_user IN ('postgres', 'service_role', 'supabase_admin')
  );
