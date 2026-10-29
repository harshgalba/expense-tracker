-- Rules for expenses that repeat every month (e.g. rent on the 1st)
CREATE TABLE recurring_expenses (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    category_id   INTEGER NOT NULL REFERENCES categories(id),
    amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    day_of_month  INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    note          TEXT,
    starts_on     DATE NOT NULL DEFAULT CURRENT_DATE,
    active        BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link each generated expense back to its rule
ALTER TABLE expenses
    ADD COLUMN recurring_id INTEGER REFERENCES recurring_expenses(id) ON DELETE SET NULL;

-- Safety net: a rule can create at most one expense per date
ALTER TABLE expenses
    ADD CONSTRAINT expenses_recurring_once UNIQUE (recurring_id, spent_on);