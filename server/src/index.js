import express from 'express';
import { pool } from './db.js';
import expensesRouter from './routes/expenses.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/requireAuth.js';
import categoriesRouter from './routes/categories.js';

const app = express();

app.use(express.json());

app.get('/api/health', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ ok: true, dbTime: result.rows[0].now });
});

app.use('/api/auth', authRouter);

app.use('/api/expenses', requireAuth , expensesRouter);

app.use('/api/categories', requireAuth, categoriesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
