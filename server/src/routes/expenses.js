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

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
    const id =Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0){
        return res.status(400).json({ error: 'id must be a whole positive number'});
    }
    
    const sql = `
        SELECT e.id, e.amount, e.spent_on, e.note, e.category_id, c.name AS category
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        WHERE e.id = $1 AND e.user_id = $2`;

    const { rows } = await pool.query(sql, [id,TEMP_USER_ID]);

    if (rows.length === 0) {
        return res.status(404).json({ error: 'Expense not found'});
    }
    res.json(rows[0]);
});

export default router;