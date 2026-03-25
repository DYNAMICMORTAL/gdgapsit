import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const app = express();
const PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'gdgapsit-secret-2025';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true // reflect-origin (or specify your vercel domain)
    : 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// ── Auth middleware ──────────────────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

// ── GET /api/events ─────────────────────────────────────────────
app.get('/api/events', async (req, res) => {
  try {
    const { rows: events } = await pool.query(
      `SELECT e.*,
        COALESCE(json_agg(et.topic ORDER BY et.position) FILTER (WHERE et.topic IS NOT NULL), '[]') AS topics
       FROM events e
       LEFT JOIN event_topics et ON et.event_id = e.id
       GROUP BY e.id
       ORDER BY e.display_index ASC`
    );
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ── GET /api/events/:slug ────────────────────────────────────────
app.get('/api/events/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*,
        COALESCE(json_agg(et.topic ORDER BY et.position) FILTER (WHERE et.topic IS NOT NULL), '[]') AS topics
       FROM events e
       LEFT JOIN event_topics et ON et.event_id = e.id
       WHERE e.slug = $1
       GROUP BY e.id`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// ── GET /api/team ────────────────────────────────────────────────
app.get('/api/team', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM team_members WHERE is_visible = TRUE ORDER BY display_order ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// ── GET /api/gallery ─────────────────────────────────────────────
app.get('/api/gallery', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM gallery_items WHERE is_visible = TRUE ORDER BY display_order ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// ── POST /api/events/:slug/quiz/join ──────────────────────────────
app.post('/api/events/:slug/quiz/join', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const { rows: [event] } = await pool.query(
      `SELECT quiz_state FROM events WHERE slug = $1`,
      [req.params.slug]
    );

    if (!event) return res.status(404).json({ error: 'Event not found' });

    let state = event.quiz_state || {};
    if (state.status !== 'lobby') {
      return res.status(400).json({ error: 'Quiz is not in lobby state' });
    }

    const participants = state.participants || [];
    if (!participants.some(p => p.name === name)) {
      participants.push({ name, joinedAt: new Date().toISOString() });
    }

    state.participants = participants;

    await pool.query(
      `UPDATE events SET quiz_state = $1 WHERE slug = $2`,
      [JSON.stringify(state), req.params.slug]
    );

    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join quiz lobby' });
  }
});

// ── GET /api/quiz/:slug ──────────────────────────────────────────
app.get('/api/quiz/:slug', async (req, res) => {
  try {
    const { rows: [event] } = await pool.query(
      `SELECT id, title, quiz_enabled FROM events WHERE slug = $1`,
      [req.params.slug]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.quiz_enabled) return res.json({ quiz_enabled: false, questions: [] });

    const { rows: questions } = await pool.query(
      `SELECT q.*,
        COALESCE(json_agg(json_build_object('id', o.id, 'option_text', o.option_text, 'position', o.position)
          ORDER BY o.position) FILTER (WHERE o.id IS NOT NULL), '[]') AS options
       FROM quiz_questions q
       LEFT JOIN quiz_options o ON o.question_id = q.id
       WHERE q.event_id = $1
       GROUP BY q.id
       ORDER BY q.position ASC`,
      [event.id]
    );
    res.json({ quiz_enabled: true, title: `${event.title} Quiz`, questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// ── GET /api/settings ────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT key, value FROM site_settings`);
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── POST /api/admin/login ────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM admin_users WHERE email = $1 AND is_active = TRUE`,
      [email]
    );
    const admin = rows[0];

    // Support legacy plain-text fallback for first login before DB is seeded
    const isMatch = admin
      ? await bcrypt.compare(password, admin.password_hash).catch(() => false)
      : false;

    const legacyMatch =
      !isMatch &&
      email === 'admin@gdgapsit.com' &&
      password === 'gdgapsit2025';

    if (!isMatch && !legacyMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login if DB user
    if (admin) {
      await pool.query(`UPDATE admin_users SET last_login = NOW() WHERE id = $1`, [admin.id]);
    }

    const token = jwt.sign(
      { email: admin?.email ?? email, id: admin?.id ?? 0 },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, email: admin?.email ?? email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES (protected)
// ═══════════════════════════════════════════════════════════════

// ── GET /api/admin/stats ─────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, async (req, res) => {
  try {
    const [{ rows: [ec] }, { rows: [tc] }, { rows: [gc] }] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM events`),
      pool.query(`SELECT COUNT(*) FROM team_members WHERE is_visible = TRUE`),
      pool.query(`SELECT COUNT(*) FROM gallery_items WHERE is_visible = TRUE`),
    ]);
    res.json({
      events: parseInt(ec.count),
      team: parseInt(tc.count),
      gallery: parseInt(gc.count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── POST /api/admin/events ───────────────────────────────────────
app.post('/api/admin/events', requireAuth, async (req, res) => {
  const { topics = [], quiz_data, ...eventData } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cols = Object.keys(eventData).filter(k => k !== 'id');
    const vals = cols.map(k => eventData[k]);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: [event] } = await client.query(
      `INSERT INTO events (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      vals
    );
    if (topics.length > 0) {
      for (let i = 0; i < topics.length; i++) {
        await client.query(
          `INSERT INTO event_topics (event_id, topic, position) VALUES ($1, $2, $3)`,
          [event.id, topics[i], i]
        );
      }
    }

    if (quiz_data !== undefined) {
      const parsedQuizData = typeof quiz_data === 'string' ? JSON.parse(quiz_data) : quiz_data;
      if (Array.isArray(parsedQuizData)) {
        for (let i = 0; i < parsedQuizData.length; i++) {
          const q = parsedQuizData[i];
          const qType = q.type || 'mcq';
          const points = q.points || 100;

          const { rows: [insertedQ] } = await client.query(
            `INSERT INTO quiz_questions (event_id, question_text, type, correct_keywords, correct_option, explanation, points, position)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [event.id, q.question, qType, q.correct_keywords || [], q.correctIndex ?? 0, q.explanation || '', points, i]
          );

          if (qType === 'mcq' && Array.isArray(q.options)) {
            for (let j = 0; j < q.options.length; j++) {
              await client.query(
                `INSERT INTO quiz_options (question_id, option_text, position) VALUES ($1, $2, $3)`,
                [insertedQ.id, q.options[j], j]
              );
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json(event);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  } finally {
    client.release();
  }
});

// ── PUT /api/admin/events/:slug ──────────────────────────────────
app.put('/api/admin/events/:slug', requireAuth, async (req, res) => {
  const { topics, quiz_data, ...eventData } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatable = ['title', 'type', 'date_display', 'date_start', 'date_end', 'short_date', 'month', 'location', 'description',
      'long_description', 'attendance', 'duration', 'format', 'is_inter_college', 'is_featured',
      'badge_color', 'type_color', 'banner_color_1', 'banner_color_2', 'gradient', 'image_url',
      'quiz_enabled', 'display_index', 'speakers', 'agenda', 'faqs', 'sponsors', 'registration_link'];
    const sets = updatable
      .filter(k => eventData[k] !== undefined)
      .map((k, i) => `${k} = $${i + 2}`);
    const vals = updatable.filter(k => eventData[k] !== undefined).map(k => eventData[k]);

    const { rows: [event] } = await client.query(
      `UPDATE events SET ${sets.join(', ')} WHERE slug = $1 RETURNING *`,
      [req.params.slug, ...vals]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Update topics if provided
    if (topics !== undefined) {
      await client.query(`DELETE FROM event_topics WHERE event_id = $1`, [event.id]);
      for (let i = 0; i < topics.length; i++) {
        await client.query(
          `INSERT INTO event_topics (event_id, topic, position) VALUES ($1, $2, $3)`,
          [event.id, topics[i], i]
        );
      }
    }

    // Update quiz if provided
    if (quiz_data !== undefined) {
      await client.query(`UPDATE events SET quiz_data = $1 WHERE id = $2`, [JSON.stringify(quiz_data), event.id]);
      await client.query(`DELETE FROM quiz_questions WHERE event_id = $1`, [event.id]);

      const parsedQuizData = typeof quiz_data === 'string' ? JSON.parse(quiz_data) : quiz_data;
      if (Array.isArray(parsedQuizData)) {
        for (let i = 0; i < parsedQuizData.length; i++) {
          const q = parsedQuizData[i];
          const qType = q.type || 'mcq';
          const points = q.points || 100;

          const { rows: [insertedQ] } = await client.query(
            `INSERT INTO quiz_questions (event_id, question_text, type, correct_keywords, correct_option, explanation, points, position)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [event.id, q.question, qType, q.correct_keywords || [], q.correctIndex ?? 0, q.explanation || '', points, i]
          );

          if (qType === 'mcq' && Array.isArray(q.options)) {
            for (let j = 0; j < q.options.length; j++) {
              await client.query(
                `INSERT INTO quiz_options (question_id, option_text, position) VALUES ($1, $2, $3)`,
                [insertedQ.id, q.options[j], j]
              );
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    res.json(event);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update event' });
  } finally {
    client.release();
  }
});

// ── DELETE /api/admin/events/:slug ───────────────────────────────
app.delete('/api/admin/events/:slug', requireAuth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM events WHERE slug = $1`, [req.params.slug]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ── POST /api/admin/events/:slug/quiz-toggle ─────────────────────
app.post('/api/admin/events/:slug/quiz-toggle', requireAuth, async (req, res) => {
  try {
    const { enabled } = req.body;
    const { rows: [event] } = await pool.query(
      `UPDATE events SET quiz_enabled = $1 WHERE slug = $2 RETURNING slug, quiz_enabled`,
      [enabled, req.params.slug]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle quiz' });
  }
});

// ── PUT /api/admin/events/:slug/quiz-state ───────────────────────
app.put('/api/admin/events/:slug/quiz-state', requireAuth, async (req, res) => {
  try {
    const { quiz_state } = req.body;
    const { rows: [event] } = await pool.query(
      `UPDATE events SET quiz_state = $1 WHERE slug = $2 RETURNING slug, quiz_state`,
      [JSON.stringify(quiz_state), req.params.slug]
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update quiz state' });
  }
});

// ── POST /api/admin/team ─────────────────────────────────────────
app.post('/api/admin/team', requireAuth, async (req, res) => {
  const { name, role, role_color, bio, dicebear_seed, linkedin_url, email, is_lead, team_type, display_order, profile_picture_url, branch, year } = req.body;
  try {
    const { rows: [member] } = await pool.query(
      `INSERT INTO team_members (name, role, role_color, bio, dicebear_seed, linkedin_url, email, is_lead, team_type, display_order, profile_picture_url, branch, year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [name, role, role_color, bio, dicebear_seed, linkedin_url, email, is_lead ?? false, team_type ?? 'core', display_order ?? 0, profile_picture_url, branch, year]
    );
    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// ── PUT /api/admin/team/:id ──────────────────────────────────────
app.put('/api/admin/team/:id', requireAuth, async (req, res) => {
  const { name, role, role_color, bio, dicebear_seed, linkedin_url, email, is_lead, team_type, display_order, is_visible, profile_picture_url, branch, year } = req.body;
  try {
    const { rows: [member] } = await pool.query(
      `UPDATE team_members SET name=$1,role=$2,role_color=$3,bio=$4,dicebear_seed=$5,
       linkedin_url=$6,email=$7,is_lead=$8,team_type=$9,display_order=$10,is_visible=$11,
       profile_picture_url=$12, branch=$13, year=$14
       WHERE id=$15 RETURNING *`,
      [name, role, role_color, bio, dicebear_seed, linkedin_url, email, is_lead, team_type, display_order, is_visible ?? true, profile_picture_url, branch, year, req.params.id]
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// ── DELETE /api/admin/team/:id ───────────────────────────────────
app.delete('/api/admin/team/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM team_members WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// ── POST /api/admin/gallery ──────────────────────────────────────
app.post('/api/admin/gallery', requireAuth, async (req, res) => {
  const { event_id, event_name, type, caption, image_url, dicebear_seed, color, display_order } = req.body;
  try {
    const { rows: [item] } = await pool.query(
      `INSERT INTO gallery_items (event_id, event_name, type, caption, image_url, dicebear_seed, color, display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [event_id, event_name, type, caption, image_url, dicebear_seed, color ?? '#4285F4', display_order ?? 0]
    );
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

// ── DELETE /api/admin/gallery/:id ────────────────────────────────
app.delete('/api/admin/gallery/:id', requireAuth, async (req, res) => {
  try {
    await pool.query(`DELETE FROM gallery_items WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// ── PUT /api/admin/settings ──────────────────────────────────────
app.put('/api/admin/settings', requireAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(req.body)) {
      await client.query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    client.release();
  }
});

// ── GET /api/admin/events (with quiz_enabled) ────────────────────
app.get('/api/admin/events', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*,
        COALESCE(json_agg(et.topic ORDER BY et.position) FILTER (WHERE et.topic IS NOT NULL), '[]') AS topics
       FROM events e
       LEFT JOIN event_topics et ON et.event_id = e.id
       GROUP BY e.id
       ORDER BY e.display_index ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ── PUBLIC QUIZ ENDPOINTS ────────────────────────────────────────
app.post('/api/events/:slug/quiz/submit', async (req, res) => {
  try {
    const { participant_name, participant_email, score, total_questions, time_taken_seconds } = req.body;
    const { rows: [result] } = await pool.query(
      `INSERT INTO event_quiz_scores (event_slug, participant_name, participant_email, score, total_questions, time_taken_seconds) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.params.slug, participant_name, participant_email, score, total_questions, time_taken_seconds]
    );
    res.status(201).json(result);
  } catch (err) {
    console.error("Quiz Submit Error:", err);
    res.status(500).json({ error: 'Failed to submit quiz score' });
  }
});

app.get('/api/events/:slug/quiz/leaderboard', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT participant_name, score, time_taken_seconds, created_at 
       FROM event_quiz_scores 
       WHERE event_slug = $1 
       ORDER BY score DESC, time_taken_seconds ASC 
       LIMIT 50`,
      [req.params.slug]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ═══════════════════════════════════════════════════════════════
// CERTIFICATE ROUTES
// ═══════════════════════════════════════════════════════════════

// ── POST /api/admin/certificates/record ─── (protected) ─────────
// Save issued certificates to DB for future verification
app.post('/api/admin/certificates/record', requireAuth, async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || !records.length) return res.status(400).json({ error: 'records array required' });
  try {
    for (const r of records) {
      await pool.query(
        `INSERT INTO certificate_issuances (cert_id, student_name, student_email, event_slug, event_name)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (cert_id) DO NOTHING`,
        [r.certId, r.studentName, r.studentEmail || null, r.eventSlug, r.eventName]
      );
    }
    res.json({ recorded: records.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record certificates' });
  }
});

// ── GET /api/certificates/verify/:certId ─── (public) ───────────
// Attendees scan QR → frontend calls this to verify authenticity
app.get('/api/certificates/verify/:certId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cert_id, student_name, event_name, issued_at FROM certificate_issuances WHERE cert_id = $1`,
      [req.params.certId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Certificate not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ── POST /api/admin/certificates/send-email ─── (protected) ─────
// Send certificates via Gmail using Nodemailer + App Password
app.post('/api/admin/certificates/send-email', requireAuth, async (req, res) => {
  const { recipients, eventName, eventSlug } = req.body;
  if (!process.env.GMAIL_USER || process.env.GMAIL_APP_PASSWORD === 'xxxx xxxx xxxx xxxx') {
    return res.status(503).json({ error: 'Gmail not configured — add GMAIL_USER and GMAIL_APP_PASSWORD to .env' });
  }
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  let sent = 0; let failed = 0;
  for (const r of recipients) {
    if (!r.email) { failed++; continue; }
    try {
      await transporter.sendMail({
        from: `"GDG on Campus APSIT" <${process.env.GMAIL_USER}>`,
        to: r.email,
        subject: `Your Certificate — ${eventName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8f8f6; border-radius: 16px;">
            <div style="background: linear-gradient(135deg, #4285F4, #34A853); height: 4px; border-radius: 4px; margin-bottom: 24px;"></div>
            <p style="font-size: 16px; color: #111; font-weight: 700; margin: 0 0 8px;">Hi ${r.name},</p>
            <p style="font-size: 14px; color: #555; margin: 0 0 20px; line-height: 1.6;">
              Congratulations! Your certificate of participation for <strong>${eventName}</strong> is attached.
            </p>
            <p style="font-size: 12px; color: #888; margin: 0 0 4px;">Certificate ID</p>
            <code style="font-size: 12px; background: #efefef; padding: 6px 12px; border-radius: 6px; display: inline-block;">${r.certId}</code>
            <p style="font-size: 12px; color: #aaa; margin: 20px 0 0;">— GDG on Campus APSIT</p>
          </div>
        `,
      });
      sent++;
    } catch { failed++; }
  }
  res.json({ sent, failed });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 GDG APSIT API running on http://localhost:${PORT}`);
  });
}

export default app;


