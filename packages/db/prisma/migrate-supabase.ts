/**
 * Supabase migration script.
 *
 * Reads from OLD Supabase (OLD_DATABASE_URL, OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY)
 * Writes to NEW Supabase (DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 *
 * Migrates: Categories, Users, Books, Videos, SocialLinks, Quotes, Announcements
 * Migrates storage: sagarlad-assets/*, sagarlad-ebooks/*
 * Skips: Posts, Comments, ContactRequests, Newsletters
 *
 * Usage:
 *   OLD_DATABASE_URL="..." OLD_SUPABASE_URL="..." OLD_SUPABASE_SERVICE_ROLE_KEY="..." \
 *     npx tsx prisma/migrate-supabase.ts
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { Client } from "pg";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Load env from both app directories (new creds from site, old creds passed as OLD_* env vars)
config({ path: resolve(__dirname, "../../../apps/site/.env") });
config({ path: resolve(__dirname, "../../../apps/admin/.env") });

// ── Config ──────────────────────────────────────────────────────────
const OLD_DB_URL = process.env.OLD_DATABASE_URL;
const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL;
const OLD_SUPABASE_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;
const NEW_SUPABASE_URL = process.env.SUPABASE_URL;
const NEW_SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEW_DB_URL = process.env.DATABASE_URL;

if (!OLD_DB_URL || !OLD_SUPABASE_URL || !OLD_SUPABASE_KEY || !NEW_SUPABASE_URL || !NEW_SUPABASE_KEY || !NEW_DB_URL) {
  console.error("Missing env vars. Required:");
  console.error("  OLD_DATABASE_URL, OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY");
  console.error("  (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL loaded from apps/*/.env)");
  process.exit(1);
}

const NEW_HOST = new URL(NEW_SUPABASE_URL).host;
const OLD_HOST = new URL(OLD_SUPABASE_URL).host;

function rewriteHost(url: string | null): string | null {
  if (!url) return null;
  return url.replace(OLD_HOST, NEW_HOST);
}

// ── Clients ─────────────────────────────────────────────────────────
function makePgClient(url: string): Client {
  return new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    query_timeout: 60000,
  });
}

function makeSupabase(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── Storage migration helpers ───────────────────────────────────────
async function listAllFiles(client: SupabaseClient, bucket: string, folder: string): Promise<string[]> {
  const files: string[] = [];
  const { data, error } = await client.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) {
    console.error(`  Error listing ${bucket}/${folder}:`, error.message);
    return files;
  }
  for (const item of data ?? []) {
    if (item.id === null) {
      // It's a folder, recurse
      const sub = await listAllFiles(client, bucket, folder ? `${folder}/${item.name}` : item.name);
      files.push(...sub);
    } else {
      files.push(folder ? `${folder}/${item.name}` : item.name);
    }
  }
  return files;
}

async function migrateStorageFile(
  oldClient: SupabaseClient,
  newClient: SupabaseClient,
  bucket: string,
  filePath: string
): Promise<boolean> {
  const { data, error: dlErr } = await oldClient.storage.from(bucket).download(filePath);
  if (dlErr || !data) {
    console.error(`  Failed to download ${bucket}/${filePath}:`, dlErr?.message ?? "no data");
    return false;
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  const { error: upErr } = await newClient.storage.from(bucket).upload(filePath, buffer, {
    contentType: data.type ?? "application/octet-stream",
    upsert: true,
  });
  if (upErr) {
    console.error(`  Failed to upload ${bucket}/${filePath}:`, upErr.message);
    return false;
  }
  return true;
}

// ── DB migration helpers ────────────────────────────────────────────
async function migrateTable<T extends Record<string, any>>(
  oldDb: Client,
  newDb: Client,
  table: string,
  mapRow: (row: T) => Record<string, any>,
  label: string
): Promise<number> {
  const { rows } = await oldDb.query<T>(`SELECT * FROM "${table}"`);
  console.log(`  ${label}: ${rows.length} rows`);
  let count = 0;
  for (const row of rows) {
    const data = mapRow(row);
    const cols = Object.keys(data);
    const vals = cols.map((_, i) => `$${i + 1}`);
    const onConflict = getOnConflict(table);
    const sql = onConflict
      ? `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${vals.join(", ")}) ${onConflict}`
      : `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${vals.join(", ")})`;
    try {
      await newDb.query(sql, cols.map(c => data[c]));
      count++;
    } catch (e: any) {
      // Skip duplicates
      if (!e.message?.includes("duplicate")) {
        console.error(`    Error inserting ${table}:`, e.message);
      }
    }
  }
  return count;
}

function getOnConflict(table: string): string {
  switch (table) {
    case "Category":
      return 'ON CONFLICT ("slug") DO UPDATE SET name = EXCLUDED.name';
    case "User":
      return 'ON CONFLICT ("email") DO UPDATE SET name = EXCLUDED.name, "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role';
    case "SocialLink":
      return 'ON CONFLICT ("key") DO UPDATE SET label = EXCLUDED.label, handle = EXCLUDED.handle, href = EXCLUDED.href, icon = EXCLUDED.icon, color = EXCLUDED.color, "sortOrder" = EXCLUDED."sortOrder", active = EXCLUDED.active';
    default:
      return "";
  }
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Supabase Migration ===");
  console.log(`Old: ${OLD_SUPABASE_URL}`);
  console.log(`New: ${NEW_SUPABASE_URL}\n`);

  const oldDb = makePgClient(OLD_DB_URL);
  const newDb = makePgClient(NEW_DB_URL);
  const oldSupa = makeSupabase(OLD_SUPABASE_URL, OLD_SUPABASE_KEY);
  const newSupa = makeSupabase(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

  await oldDb.connect();
  await newDb.connect();
  console.log("Connected to both databases.\n");

  // ── 1. Categories ─────────────────────────────────────────────────
  console.log("--- Migrating Categories ---");
  const catCount = await migrateTable(oldDb, newDb, "Category", (r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    createdAt: r.createdAt,
  }), "Categories");
  console.log(`  → ${catCount} migrated\n`);

  // ── 2. Users ──────────────────────────────────────────────────────
  console.log("--- Migrating Users ---");
  const userCount = await migrateTable(oldDb, newDb, "User", (r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    emailVerified: r.emailVerified,
    image: r.image,
    passwordHash: r.passwordHash,
    role: r.role,
    twoFactorEnabled: r.twoFactorEnabled,
    twoFactorSecret: r.twoFactorSecret,
    twoFactorRecovery: r.twoFactorRecovery,
    lastLoginAt: r.lastLoginAt,
    lastLoginIp: r.lastLoginIp,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }), "Users");
  console.log(`  → ${userCount} migrated\n`);

  // ── 3. Books ──────────────────────────────────────────────────────
  console.log("--- Migrating Books ---");
  const { rows: books } = await oldDb.query('SELECT * FROM "Book"');
  console.log(`  Books: ${books.length} rows`);
  let bookCount = 0;
  for (const r of books) {
    // Skip if title already exists
    const { rows: existing } = await newDb.query('SELECT 1 FROM "Book" WHERE "title" = $1', [r.title]);
    if (existing.length > 0) continue;

    try {
      await newDb.query(
        `INSERT INTO "Book" ("id","type","title","author","tagline","description","learning","note",
         "imageUrl","buyUrl","fileKey","free","featured","published","sortOrder","currentlyReading","deletedAt","createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [r.id, r.type, r.title, r.author, r.tagline, r.description, r.learning, r.note,
         rewriteHost(r.imageUrl), r.buyUrl, r.fileKey, r.free, r.featured, r.published,
         r.sortOrder, r.currentlyReading, r.deletedAt, r.createdAt]
      );
      bookCount++;
    } catch (e: any) {
      console.error(`    Book error (${r.title}):`, e.message);
    }
  }
  console.log(`  → ${bookCount} migrated\n`);

  // ── 4. Videos ─────────────────────────────────────────────────────
  console.log("--- Migrating Videos ---");
  const videoCount = await migrateTable(oldDb, newDb, "Video", (r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    embedUrl: r.embedUrl,
    thumbnail: rewriteHost(r.thumbnail),
    content: r.content,
    layout: r.layout,
    published: r.published,
    sortOrder: r.sortOrder,
    deletedAt: r.deletedAt,
    createdAt: r.createdAt,
    categoryId: r.categoryId,
  }), "Videos");
  console.log(`  → ${videoCount} migrated\n`);

  // ── 5. SocialLinks ────────────────────────────────────────────────
  console.log("--- Migrating SocialLinks ---");
  const socialCount = await migrateTable(oldDb, newDb, "SocialLink", (r) => ({
    id: r.id,
    key: r.key,
    label: r.label,
    handle: r.handle,
    href: r.href,
    icon: r.icon,
    logoUrl: r.logoUrl,
    color: r.color,
    sortOrder: r.sortOrder,
    active: r.active,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }), "SocialLinks");
  console.log(`  → ${socialCount} migrated\n`);

  // ── 6. Quotes ─────────────────────────────────────────────────────
  console.log("--- Migrating Quotes ---");
  const { rows: quotes } = await oldDb.query('SELECT * FROM "Quote"');
  console.log(`  Quotes: ${quotes.length} rows`);
  let quoteCount = 0;
  for (const q of quotes) {
    try {
      await newDb.query(
        'INSERT INTO "Quote" ("id", "text", "tag", "createdAt") VALUES ($1, $2, $3, $4)',
        [q.id, q.text, q.tag, q.createdAt]
      );
      quoteCount++;
    } catch (e: any) {
      if (!e.message?.includes("duplicate")) console.error("    Quote error:", e.message);
    }
  }
  console.log(`  → ${quoteCount} migrated\n`);

  // ── 7. Announcements ──────────────────────────────────────────────
  console.log("--- Migrating Announcements ---");
  const { rows: announcements } = await oldDb.query('SELECT * FROM "Announcement"');
  console.log(`  Announcements: ${announcements.length} rows`);
  let annCount = 0;
  for (const a of announcements) {
    try {
      await newDb.query(
        `INSERT INTO "Announcement" ("id","title","description","imageUrl","buttonText","buttonLink",
         "barText","barLink","barStyle","barSpeed","barBgColor","barColor","active","eventDate","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [a.id, a.title, a.description, a.imageUrl, a.buttonText, a.buttonLink,
         a.barText, a.barLink, a.barStyle, a.barSpeed, a.barBgColor, a.barColor,
         a.active, a.eventDate, a.createdAt, a.updatedAt]
      );
      annCount++;
    } catch (e: any) {
      if (!e.message?.includes("duplicate")) console.error("    Announcement error:", e.message);
    }
  }
  console.log(`  → ${annCount} migrated\n`);

  // ── 8. Storage: sagarlad-assets ───────────────────────────────────
  console.log("--- Migrating Storage: sagarlad-assets ---");
  // Ensure buckets exist on new Supabase
  for (const [name, opts] of [
    ["sagarlad-assets", { public: true, fileSizeLimit: 8 * 1024 * 1024 }],
    ["sagarlad-ebooks", { public: false, fileSizeLimit: 25 * 1024 * 1024 }],
  ]) {
    const { error } = await newSupa.storage.getBucket(name);
    if (error) {
      console.log(`  Creating bucket: ${name}`);
      const { error: createErr } = await newSupa.storage.createBucket(name, opts);
      if (createErr) console.error(`  Failed to create bucket ${name}:`, createErr.message);
      else console.log(`  Bucket ${name} created`);
    }
  }

  const folders = ["books", "avatars", "videos", "covers", "announcements", "general"];
  let assetCount = 0;
  for (const folder of folders) {
    const files = await listAllFiles(oldSupa, "sagarlad-assets", folder);
    console.log(`  ${folder}/: ${files.length} files`);
    for (const f of files) {
      const ok = await migrateStorageFile(oldSupa, newSupa, "sagarlad-assets", f);
      if (ok) assetCount++;
    }
  }
  console.log(`  → ${assetCount} storage files migrated\n`);

  // ── 9. Storage: sagarlad-ebooks ───────────────────────────────────
  console.log("--- Migrating Storage: sagarlad-ebooks ---");
  const ebookFiles = await listAllFiles(oldSupa, "sagarlad-ebooks", "books");
  console.log(`  books/: ${ebookFiles.length} files`);
  let ebookCount = 0;
  for (const f of ebookFiles) {
    const ok = await migrateStorageFile(oldSupa, newSupa, "sagarlad-ebooks", f);
    if (ok) ebookCount++;
  }
  console.log(`  → ${ebookCount} ebook files migrated\n`);

  // ── Summary ───────────────────────────────────────────────────────
  console.log("=== Migration Complete ===");
  console.log(`Categories:   ${catCount}`);
  console.log(`Users:        ${userCount}`);
  console.log(`Books:        ${bookCount}`);
  console.log(`Videos:       ${videoCount}`);
  console.log(`SocialLinks:  ${socialCount}`);
  console.log(`Quotes:       ${quoteCount}`);
  console.log(`Announcements:${annCount}`);
  console.log(`Storage:      ${assetCount + ebookCount} files (${assetCount} assets + ${ebookCount} ebooks)`);

  await oldDb.end();
  await newDb.end();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
