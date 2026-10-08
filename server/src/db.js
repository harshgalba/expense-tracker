import pg from 'pg';

const { Pool } = pg;

// 1082 is Postgres's internal type id for DATE.
// Return it as the raw 'YYYY-MM-DD' string instead of a JS Date.
pg.types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});