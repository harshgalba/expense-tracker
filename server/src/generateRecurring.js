import { pool } from './db.js';

// Creates the expenses that this user's active recurring rules owe,
// from each rule's starts_on up to today. Safe to run any number of times:
// the unique constraint (recurring_id, spent_on) skips ones that already exist.
export async function generateRecurring(userId) {
  await pool.query(
    `INSERT INTO expenses (user_id, category_id, amount, spent_on, note, recurring_id)
     SELECT r.user_id, r.category_id, r.amount, d.due, r.note, r.id
     FROM recurring_expenses r
     -- one row per month, from the rule's first month to this month
     CROSS JOIN LATERAL generate_series(
       date_trunc('month', r.starts_on),
       date_trunc('month', CURRENT_DATE),
       INTERVAL '1 month'
     ) AS m(month_start)
     -- the due date that month; day 31 becomes the last day in shorter months
     CROSS JOIN LATERAL (
       SELECT (m.month_start + (LEAST(
                 r.day_of_month,
                 EXTRACT(DAY FROM m.month_start + INTERVAL '1 month' - INTERVAL '1 day')::int
               ) - 1) * INTERVAL '1 day')::date AS due
     ) AS d
     WHERE r.user_id = $1
       AND r.active
       AND d.due >= r.starts_on
       AND (r.generated_until IS NULL OR d.due > r.generated_until)
       AND d.due <= CURRENT_DATE
     ON CONFLICT (recurring_id, spent_on) DO NOTHING`,
    [userId]
  );
  // Everything up to today is now handled for this user's active rules
  await pool.query(
    `UPDATE recurring_expenses
     SET generated_until = CURRENT_DATE
     WHERE user_id = $1 AND active`,
    [userId]
  );
}