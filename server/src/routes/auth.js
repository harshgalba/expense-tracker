import jwt from 'jsonwebtoken';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = Router();

// Checks the register body. Returns an error message, or null if valid.
function validateRegister(body) {
  const { name, email, password } = body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return 'name is required';
  }
  if (typeof email !== 'string' || !email.includes('@')) {
    return 'email must be a valid email address';
  }
  if (typeof password !== 'string' || password.length < 8) {
    return 'password must be at least 8 characters';
  }
  return null;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const error = validateRegister(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();

  // Never store the real password, only the bcrypt hash.
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,   // no password_hash here
      [name, email, passwordHash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    // 23505 = Postgres "unique_violation" (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'email already registered' });
    }
    throw err; // anything else goes to the error handler in index.js
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const { rows } = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );
  const user = rows[0];

  // Same message for "no such user" and "wrong password",
  // so attackers can't find out which emails are registered.
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    return res.status(401).json({ error: 'invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id },          // what goes inside the token
    process.env.JWT_SECRET,       // signs it
    { expiresIn: '1h' }           // token stops working after 1 hour
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

export default router;