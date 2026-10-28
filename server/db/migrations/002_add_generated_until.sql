-- How far each rule has been generated (NULL = nothing generated yet).
-- The generator only creates due dates after this, so deleted or edited
-- generated expenses are not recreated, and paused months are skipped.
ALTER TABLE recurring_expenses
    ADD COLUMN generated_until DATE;

-- Existing rules: mark them as generated up to their latest generated expense
UPDATE recurring_expenses r
SET generated_until = (
    SELECT MAX(e.spent_on) FROM expenses e WHERE e.recurring_id = r.id
);
