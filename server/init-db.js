/**
 * GDG APSIT Hub — DB Init Script
 * Run once:  node server/init-db.js
 *
 * Creates all tables (IF NOT EXISTS) and seeds site_settings defaults.
 * Safe to re-run — all statements are idempotent.
 */

import pool from './db.js';

const schema = `
-- ── Shared trigger ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ── EVENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(120) UNIQUE NOT NULL,
  title            TEXT NOT NULL,
  type             VARCHAR(30) NOT NULL CHECK (type IN ('Study Jam','Workshop','Session','Hackathon','Bootcamp')),
  date_display     VARCHAR(60) NOT NULL DEFAULT '',
  date_start       DATE,
  date_end         DATE,
  short_date       VARCHAR(20),
  month            VARCHAR(20),
  location         TEXT,
  description      TEXT,
  long_description TEXT,
  attendance       VARCHAR(20),
  duration         VARCHAR(30),
  format           VARCHAR(40),
  is_inter_college  BOOLEAN DEFAULT FALSE,
  is_featured      BOOLEAN DEFAULT FALSE,
  badge_color      VARCHAR(10) DEFAULT '#4285F4',
  type_color       VARCHAR(10) DEFAULT '#4285F4',
  banner_color_1   VARCHAR(10) DEFAULT '#4285F4',
  banner_color_2   VARCHAR(10) DEFAULT '#1A73E8',
  gradient         TEXT,
  image_url        TEXT,
  speakers         JSONB DEFAULT '[]'::jsonb,
  agenda           JSONB DEFAULT '[]'::jsonb,
  faqs             JSONB DEFAULT '[]'::jsonb,
  sponsors         JSONB DEFAULT '[]'::jsonb,
  quiz_enabled     BOOLEAN DEFAULT FALSE,
  quiz_data        JSONB DEFAULT '[]'::jsonb,
  quiz_state       JSONB DEFAULT '{}'::jsonb,
  display_index    INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS speakers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS quiz_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS quiz_state JSONB DEFAULT '{}'::jsonb;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'events_updated_at') THEN
    CREATE TRIGGER events_updated_at BEFORE UPDATE ON events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ── EVENT TOPICS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_topics (
  id       SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  topic    VARCHAR(80) NOT NULL,
  position SMALLINT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_event_topics_event_id ON event_topics(event_id);

-- ── TEAM MEMBERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  role           VARCHAR(80)  NOT NULL,
  role_color     VARCHAR(10)  DEFAULT '#4285F4',
  bio            TEXT,
  dicebear_seed  VARCHAR(60),
  linkedin_url   TEXT,
  email          VARCHAR(150),
  is_lead        BOOLEAN DEFAULT FALSE,
  team_type      VARCHAR(20)  DEFAULT 'core' CHECK (team_type IN ('core','extended')),
  display_order  SMALLINT DEFAULT 0,
  is_visible     BOOLEAN DEFAULT TRUE,
  profile_picture_url TEXT,
  branch         VARCHAR(80),
  year           VARCHAR(20),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS branch VARCHAR(80);
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS year VARCHAR(20);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'team_members_updated_at') THEN
    CREATE TRIGGER team_members_updated_at BEFORE UPDATE ON team_members
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ── GALLERY ITEMS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_items (
  id            SERIAL PRIMARY KEY,
  event_id      INT REFERENCES events(id) ON DELETE SET NULL,
  event_name    VARCHAR(150),
  type          VARCHAR(30) NOT NULL CHECK (type IN ('Workshop','Hackathon','Study Jam','Session','Bootcamp','BTS')),
  caption       TEXT,
  image_url     TEXT,
  dicebear_seed VARCHAR(60),
  color         VARCHAR(10) DEFAULT '#4285F4',
  is_visible    BOOLEAN DEFAULT TRUE,
  display_order SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_type  ON gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_gallery_event ON gallery_items(event_id);

-- ── QUIZ QUESTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id               SERIAL PRIMARY KEY,
  event_id         INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question_text    TEXT NOT NULL,
  type             VARCHAR(10) NOT NULL CHECK (type IN ('mcq','short')),
  correct_keywords TEXT[],
  correct_option   SMALLINT,
  explanation      TEXT,
  points           SMALLINT DEFAULT 100,
  position         SMALLINT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_event ON quiz_questions(event_id);

-- ── QUIZ OPTIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_options (
  id          SERIAL PRIMARY KEY,
  question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  position    SMALLINT DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON quiz_options(question_id);

-- ── SITE SETTINGS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key         VARCHAR(80) PRIMARY KEY,
  value       TEXT,
  description VARCHAR(200),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value, description) VALUES
  ('club_name',         'GDG on Campus APSIT',                     'Club name for header/meta'),
  ('email',             'gdgoncampus.apsit@gmail.com',              'Contact email'),
  ('college',           'A.P. Shah Institute of Technology, Thane', 'Full college name'),
  ('founded_year',      '2022',                                     'Year founded'),
  ('github_url',        'https://github.com/gdg-apsit',             'GitHub URL'),
  ('linkedin_url',      '',                                         'LinkedIn URL'),
  ('instagram_url',     '',                                         'Instagram URL'),
  ('gdg_community_url', 'https://gdg.community.dev',                'GDG community page')
ON CONFLICT (key) DO NOTHING;

-- ── ADMIN USERS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  VARCHAR(100),
  is_active     BOOLEAN DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── CERTIFICATE ISSUANCES ─────────────────────────────────────────────────────
-- Each row = one certificate issued to one student for one event.
-- cert_id is the unique verifiable identifier printed/embedded as QR on the cert.
CREATE TABLE IF NOT EXISTS certificate_issuances (
  id            SERIAL PRIMARY KEY,
  cert_id       VARCHAR(60)  UNIQUE NOT NULL,  -- e.g. GDGAPSIT-hackapsit-2025-202603-a3f9b2
  student_name  VARCHAR(200) NOT NULL,
  student_email VARCHAR(200),
  event_slug    VARCHAR(120) NOT NULL,
  event_name    TEXT         NOT NULL,
  issued_at     TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cert_id     ON certificate_issuances(cert_id);
CREATE INDEX IF NOT EXISTS idx_cert_event  ON certificate_issuances(event_slug);
`;

async function init() {
  const client = await pool.connect();
  try {
    console.log('⏳ Connecting to Neon DB...');
    await client.query('SELECT 1'); // test connection
    console.log('✅ Connected!');

    console.log('⏳ Creating tables...');
    await client.query(schema);
    console.log('✅ All tables created (IF NOT EXISTS).');

    // Verify
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('\n📋 Tables in DB:');
    rows.forEach(r => console.log(`   • ${r.table_name}`));

    console.log('\n🎉 DB initialised successfully! You can now use the Admin panel to add data.');
  } catch (err) {
    console.error('❌ DB init failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
