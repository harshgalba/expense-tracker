import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const TEMP_USER_ID = 1; // TODO Day 3: replace with the logged-in user

// Checks an expense from the request body.
// Returns an error message, or null if everything is valid.
function validateExpense(body) {
  const { amount, spent_on, category_id, note } = body ?? {};

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return 'amount must be a number greater than 0';
  }

  if (amount >= 100000000) {
    return 'amount is too large!';
  }
  if (typeof spent_on !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(spent_on)) {
    return 'spent_on must be a date in YYYY-MM-DD format';
  }
  const date = new Date(`${spent_on}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== spent_on) {
    return 'spent_on is not a real date';
  }
  if (!Number.isInteger(category_id) || category_id <= 0) {
    return 'category_id must be a positive whole number';
  }
  if (note !== undefined && note !== null && typeof note !== 'string') {
    return 'note must be text';
  }
  return null;
}

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
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  const sql = `
        SELECT e.id, e.amount, e.spent_on, e.note, e.category_id, c.name AS category
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        WHERE e.id = $1 AND e.user_id = $2`;

  const { rows } = await pool.query(sql, [id, TEMP_USER_ID]);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(rows[0]);
});

// POST /api/expenses
router.post('/', async (req, res) => {
  const error = validateExpense(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { amount, spent_on, category_id, note } = req.body;

  // The category must exist AND be one this user can see:
  // a default (user_id IS NULL) or one of their own.
  const category = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
    [category_id, TEMP_USER_ID]
  );
  if (category.rows.length === 0) {
    return res.status(400).json({ error: 'category not found' });
  }

  const { rows } = await pool.query(
    `INSERT INTO expenses (user_id, category_id, amount, spent_on, note)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, amount, spent_on, note, category_id`,
    [TEMP_USER_ID, category_id, amount, spent_on, note ?? null]
  );

  res.status(201).json(rows[0]);
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  const error = validateExpense(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { amount, spent_on, category_id, note } = req.body;

  const category = await pool.query(
    'SELECT id FROM categories WHERE id = $1 AND (user_id IS NULL OR user_id = $2)',
    [category_id, TEMP_USER_ID]
  );
  if (category.rows.length === 0) {
    return res.status(400).json({ error: 'category not found' });
  }

  const { rows } = await pool.query(
    `UPDATE expenses
     SET amount = $1, spent_on = $2, category_id = $3, note = $4
     WHERE id = $5 AND user_id = $6
     RETURNING id, amount, spent_on, note, category_id`,
    [amount, spent_on, category_id, note ?? null, id, TEMP_USER_ID]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json(rows[0]);
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  // 1. Check the id in the URL
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  // 2. Delete only if it belongs to this user
  const result = await pool.query(
    'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
    [id, TEMP_USER_ID]
  );

  // 3. Nothing deleted = not found / not yours
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  // 4. Success, nothing to send back
  res.status(204).end();
});

export default router;