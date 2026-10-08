users
  id             — INTEGER GENERATED ALWAYS AS IDENTITY, required, unique
  name           — TEXT, required 
  email          — TEXT, required, unique
  password_hash  — TEXT, required
  created_at     — TIMESTAMPTZ, required, DEFAULT now()
    
categories
  (defaults + custom), users start with a pre defined list but can add their own

  id          — INTEGER GENERATED ALWAYS AS IDENTITY, required, unique
  name        — TEXT, required
  user_id     — INTEGER, optional, points to users.id
  created_at  — TIMESTAMPTZ, required, DEFAULT now()

expenses
  id           — INTEGER GENERATED ALWAYS AS IDENTITY, required, unique
  user_id      — INTEGER, required, points to users.id
  category_id  — INTEGER, required, points to categories.id
  amount       — NUMERIC(10,2), required, must be > 0
  spent_on     — DATE, required
  note         — TEXT, optional
  created_at   — TIMESTAMPTZ, required, DEFAULT now()