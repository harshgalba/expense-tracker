import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Checks a recurring rule from the request body.
// Returns an error message, or null if everything is valid.
function validateRecurring(body) {
  const { amount, day_of_month, category_id, note, starts_on } = body ?? {};

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return 'amount must be a number greater than 0';
  }
  if (amount >= 100000000) {
    return 'amount is too large!';
  }
  if (!Number.isInteger(day_of_month) || day_of_month < 1 || day_of_month > 31) {
    return 'day_of_month must be a whole number from 1 to 31';
  }
  if (!Number.isInteger(category_id) || category_id <= 0) {
    return 'category_id must be a positive whole number';
  }
  if (note !== undefined && note !== null && typeof note !== 'string') {
    return 'note must be text';
  }
  // starts_on is optional; the database defaults it to today
  if (starts_on !== undefined && (typeof starts_on !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(starts_on))) {
    return 'starts_on must be a date in YYYY-MM-DD format';
  }
  return null;
}

// GET /api/recurring
// This user's rules, with the category name.
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.amount, r.day_of_month, r.note, r.starts_on, r.active,
            r.category_id, c.name AS category
     FROM recurring_expenses r
     JOIN categories c ON c.id = r.category_id
     WHERE r.user_id = $1
     ORDER BY r.day_of_month, r.id`,
    [req.userId]
  );
  res.json(rows);
});

// POST /api/recurring
// Creates a monthly rule for the logged-in user.
router.post('/', async (req, res) => {
  const error = validateRecurring(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { amount, day_of_month, category_id, note, starts_on } = req.body;

  // The category must be a default one or this user's own
  const category = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
    [category_id, req.userId]
  );
  if (category.rows.length === 0) {
    return res.status(400).json({ error: 'category not found' });
  }

  const { rows } = await pool.query(
    `INSERT INTO recurring_expenses (user_id, category_id, amount, day_of_month, note, starts_on)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::date, CURRENT_DATE))
     RETURNING id, amount, day_of_month, note, starts_on, active, category_id`,
    [req.userId, category_id, amount, day_of_month, note?.trim() || null, starts_on ?? null]
  );

  res.status(201).json(rows[0]);
});

// PATCH /api/recurring/:id
// Pause ({ "active": false }) or resume ({ "active": true }) a rule.
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  const { active } = req.body ?? {};
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be true or false' });
  }

  // Resuming starts from today: mark everything before today as handled,
  // so the paused months are not back-filled
  const { rows } = await pool.query(
    `UPDATE recurring_expenses
     SET active = $1,
         generated_until = CASE WHEN $1 THEN CURRENT_DATE - 1 ELSE generated_until END
     WHERE id = $2 AND user_id = $3
     RETURNING id, amount, day_of_month, note, starts_on, active, category_id`,
    [active, id, req.userId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'recurring expense not found' });
  }

  res.json(rows[0]);
});

// DELETE /api/recurring/:id
// Removes the rule. Expenses it already created stay (they are history).
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  const result = await pool.query(
    'DELETE FROM recurring_expenses WHERE id = $1 AND user_id = $2',
    [id, req.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'recurring expense not found' });
  }

  res.status(204).end();
});

export default router;