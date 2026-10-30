-- Default categories every user sees (user_id NULL = shared default).
-- Run once on a fresh database, after schema.sql.
INSERT INTO categories (name) VALUES
    ('Food'),
    ('Rent');