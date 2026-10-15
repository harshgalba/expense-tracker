import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/categories
// Defaults (user_id IS NULL) + this user's own categories.

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, name, user_id IS NOT NULL AS is_custom
     FROM categories
     WHERE user_id IS NULL OR user_id = $1
     ORDER BY is_custom, name`,
    [req.userId]
  );
  res.json(rows);
});

// POST /api/categories
// Creates a custom category for the logged-in user.

router.post('/', async (req, res) => {
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required' });
  }
  if (name.trim().length > 50) {
    return res.status(400).json({ error: 'name must be 50 characters or fewer' });
  }

  const cleanName = name.trim();

  // Block duplicates among the categories this user can see
  // (defaults + their own). LOWER() makes "food" match "Food".
  const existing = await pool.query(
    `SELECT id FROM categories
     WHERE LOWER(name) = LOWER($1)
       AND (user_id IS NULL OR user_id = $2)`,
    [cleanName, req.userId]
  );
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'category already exists' });
  }

  const { rows } = await pool.query(
    `INSERT INTO categories (name, user_id)
     VALUES ($1, $2)
     RETURNING id, name, true AS is_custom`,
    [cleanName, req.userId]
  );

  res.status(201).json(rows[0]);
});

// DELETE /api/categories/:id
// Only the user's own custom categories can be deleted.

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'id must be a whole positive number' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    // Nothing deleted = doesn't exist, is a default, or isn't yours
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'category not found' });
    }

    res.status(204).end();
  } catch (err) {
    // 23503 = foreign key violation (expenses still use this category)
    if (err.code === '23503') {
      return res.status(409).json({ error: 'category is used by expenses' });
    }
    throw err;
  }
});

export default router;