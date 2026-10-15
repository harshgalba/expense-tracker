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

export default router;