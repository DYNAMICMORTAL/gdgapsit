import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Prevent pg from mapping 'YYYY-MM-DD' dates into timezone-shifted JS Dates
pg.types.setTypeParser(1082, (stringValue) => stringValue);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
