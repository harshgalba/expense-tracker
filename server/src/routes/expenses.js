import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const TEMP_USER_ID = 1; // TODO Day 3: replace with the logged-in user

// GET /api/expenses?month=YYYY-MM
router.get('/', async (req, res) => {
  const { month } = req.query;

  if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
    return res.status(400).json({ error: 'month must be YYYY-MM' });
  }

  const sql = `
    SELECT e.id, e.amount, e.spent_on, e.note, e.category_id, c.name AS category
    FROM expenses e
    JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = $1
      AND e.spent_on >= $2::date
      AND e.spent_on <  $2::date + INTERVAL '1 month'
    ORDER BY e.spent_on DESC, e.id DESC`;

  const { rows } = await pool.query(sql, [TEMP_USER_ID, `${month}-01`]);
  res.json(rows);
});

export default router;