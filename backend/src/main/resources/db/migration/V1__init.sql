-- Needed so a plain integer/UUID column can be combined with a date range in one exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE departments (
  id   BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('FACULTY', 'DEPT_HEAD')),
  department_id BIGINT REFERENCES departments(id)
);

CREATE TABLE equipment (
  id            BIGSERIAL PRIMARY KEY,
  asset_code    VARCHAR(20)  NOT NULL UNIQUE,
  name          VARCHAR(160) NOT NULL,
  category      VARCHAR(80)  NOT NULL,
  description   TEXT         NOT NULL DEFAULT '',
  location      VARCHAR(160) NOT NULL DEFAULT '',
  rate_per_day  NUMERIC(10,2) NOT NULL CHECK (rate_per_day >= 0),
  status        VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MAINTENANCE')),
  department_id BIGINT NOT NULL REFERENCES departments(id)
);

CREATE TABLE bookings (
  id            BIGSERIAL PRIMARY KEY,
  equipment_id  BIGINT NOT NULL REFERENCES equipment(id),
  requester_id  BIGINT NOT NULL REFERENCES users(id),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  total_cost    NUMERIC(10,2) NOT NULL,
  status        VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  decided_by    BIGINT REFERENCES users(id),
  created_at    TIMESTAMP NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date),
  -- The database itself forbids two live bookings (pending or approved) for the same equipment on overlapping days.
  EXCLUDE USING gist (
    equipment_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status IN ('PENDING', 'APPROVED'))
);
