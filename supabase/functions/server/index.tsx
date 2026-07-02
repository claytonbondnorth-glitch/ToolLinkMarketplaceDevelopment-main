import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Health check
app.get("/make-server-b9282161/health", (c) => c.json({ status: "ok" }));

// Schema setup — runs all DDL using the service role via the Management API or direct postgres
app.post("/make-server-b9282161/setup-schema", async (c) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const errors: string[] = [];

  // ── 1. Create storage bucket ───────────────────────────────────────────────
  try {
    const { error } = await admin.storage.createBucket("listing-images", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error && !error.message.includes("already exists")) {
      errors.push(`bucket: ${error.message}`);
    }
  } catch (e: any) {
    if (!String(e).includes("already exists")) errors.push(`bucket: ${e.message}`);
  }

  // ── 2. Run DDL via SUPABASE_DB_URL if available ────────────────────────────
  const dbUrl = Deno.env.get("SUPABASE_DB_URL");

  if (dbUrl) {
    try {
      // @ts-ignore — deno.land module
      const postgres = (await import("https://deno.land/x/postgresjs@v3.4.5/mod.js")).default;
      const sql = postgres(dbUrl, { ssl: "require", max: 1 });

      await sql`
        CREATE TABLE IF NOT EXISTS profiles (
          id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          name          TEXT NOT NULL DEFAULT '',
          email         TEXT,
          avatar_url    TEXT DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format',
          location      TEXT DEFAULT 'Australia',
          state         TEXT DEFAULT 'NSW',
          bio           TEXT DEFAULT '',
          phone         TEXT DEFAULT '',
          verified      BOOLEAN DEFAULT FALSE,
          is_admin      BOOLEAN DEFAULT FALSE,
          rating        NUMERIC(3,1) DEFAULT 0,
          review_count  INTEGER DEFAULT 0,
          total_listings INTEGER DEFAULT 0,
          created_at    TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`;
      await sql`CREATE POLICY IF NOT EXISTS "profiles_read_all" ON profiles FOR SELECT USING (true)`;
      await sql`CREATE POLICY IF NOT EXISTS "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`;
      await sql`CREATE POLICY IF NOT EXISTS "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id)`;

      await sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
        BEGIN
          INSERT INTO public.profiles (id, name, email)
          VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email)
          ON CONFLICT (id) DO NOTHING;
          RETURN NEW;
        END;
        $$
      `;
      await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`;
      await sql`
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS listings (
          id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title        TEXT NOT NULL,
          description  TEXT NOT NULL DEFAULT '',
          price        NUMERIC(10,2) NOT NULL DEFAULT 0,
          condition    TEXT NOT NULL DEFAULT 'Used - Good',
          brand        TEXT NOT NULL DEFAULT 'Other',
          category     TEXT NOT NULL DEFAULT '',
          category_id  TEXT NOT NULL DEFAULT '',
          location     TEXT NOT NULL DEFAULT '',
          state        TEXT NOT NULL DEFAULT '',
          images       TEXT[] DEFAULT '{}',
          seller_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          sold_to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
          featured     BOOLEAN DEFAULT FALSE,
          status       TEXT DEFAULT 'active',
          views        INTEGER DEFAULT 0,
          report_count INTEGER DEFAULT 0,
          created_at   TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`ALTER TABLE listings ENABLE ROW LEVEL SECURITY`;
      await sql`CREATE POLICY IF NOT EXISTS "listings_read_active" ON listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id)`;
      await sql`CREATE POLICY IF NOT EXISTS "listings_insert_auth" ON listings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = seller_id)`;
      await sql`CREATE POLICY IF NOT EXISTS "listings_update_own" ON listings FOR UPDATE USING (auth.uid() = seller_id)`;
      await sql`CREATE POLICY IF NOT EXISTS "listings_delete_own" ON listings FOR DELETE USING (auth.uid() = seller_id)`;

      await sql`
        CREATE TABLE IF NOT EXISTS saved_listings (
          user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
          listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (user_id, listing_id)
        )
      `;
      await sql`ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY`;
      await sql`CREATE POLICY IF NOT EXISTS "saved_own" ON saved_listings FOR ALL USING (auth.uid() = user_id)`;

      await sql`
        CREATE TABLE IF NOT EXISTS conversations (
          id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
          buyer_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
          seller_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(listing_id, buyer_id, seller_id)
        )
      `;
      await sql`ALTER TABLE conversations ENABLE ROW LEVEL SECURITY`;
      await sql`CREATE POLICY IF NOT EXISTS "conversations_participants" ON conversations FOR ALL USING (auth.uid() = buyer_id OR auth.uid() = seller_id)`;

      await sql`
        CREATE TABLE IF NOT EXISTS messages (
          id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
          text            TEXT NOT NULL,
          read            BOOLEAN DEFAULT FALSE,
          created_at      TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`ALTER TABLE messages ENABLE ROW LEVEL SECURITY`;
      await sql`
        CREATE POLICY IF NOT EXISTS "messages_participants" ON messages FOR ALL
        USING (conversation_id IN (SELECT id FROM conversations WHERE buyer_id = auth.uid() OR seller_id = auth.uid()))
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS reviews (
          id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          listing_id      UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
          reviewer_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          reviewed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
          rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
          comment         TEXT DEFAULT '',
          created_at      TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(listing_id, reviewer_id)
        )
      `;
      await sql`ALTER TABLE reviews ENABLE ROW LEVEL SECURITY`;
      await sql`CREATE POLICY IF NOT EXISTS "reviews_read_all" ON reviews FOR SELECT USING (true)`;
      await sql`
        CREATE POLICY IF NOT EXISTS "reviews_insert_own" ON reviews FOR INSERT
        WITH CHECK (
          auth.uid() = reviewer_id
          AND EXISTS (
            SELECT 1 FROM listings l
            WHERE l.id = listing_id
              AND l.status = 'sold'
              AND (
                l.seller_id = auth.uid()
                OR l.sold_to_user_id = auth.uid()
              )
          )
        )
      `;

      // Storage policies
      await sql`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('listing-images', 'listing-images', TRUE, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
        ON CONFLICT (id) DO NOTHING
      `;
      await sql`DROP POLICY IF EXISTS "listing_images_read" ON storage.objects`;
      await sql`DROP POLICY IF EXISTS "listing_images_upload" ON storage.objects`;
      await sql`DROP POLICY IF EXISTS "listing_images_delete" ON storage.objects`;
      await sql`CREATE POLICY "listing_images_read" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images')`;
      await sql`CREATE POLICY "listing_images_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.uid() IS NOT NULL)`;
      await sql`CREATE POLICY "listing_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1])`;

      await sql.end();
      return c.json({ ok: true, method: "postgres" });
    } catch (e: any) {
      errors.push(`postgres: ${e.message}`);
    }
  }

  // ── 3. Fallback: return the SQL to run manually ────────────────────────────
  return c.json({
    ok: errors.length === 0,
    method: dbUrl ? "postgres-failed" : "no-db-url",
    errors,
    note: "Please run supabase/migrations/001_schema.sql in the Supabase SQL Editor",
    sqlEditorUrl: `https://supabase.com/dashboard/project/${Deno.env.get("SUPABASE_URL")?.split("//")[1]?.split(".")[0]}/sql/new`,
  });
});

// Check if schema tables exist (used by frontend to detect setup state)
app.get("/make-server-b9282161/schema-status", async (c) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.from("listings").select("id").limit(1);
  const ready = !error || !error.message.includes("does not exist");

  // Also ensure bucket exists
  const { data: buckets } = await admin.storage.listBuckets();
  const hasBucket = buckets?.some((b: any) => b.id === "listing-images") ?? false;

  if (!hasBucket) {
    await admin.storage.createBucket("listing-images", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
  }

  return c.json({ ready, hasBucket: true });
});

Deno.serve(app.fetch);
