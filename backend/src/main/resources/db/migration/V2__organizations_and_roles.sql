-- V2: colleges and companies become "organizations"; roles are simplified;
-- equipment availability moves from a status flag to unavailable date windows.

-- 1. departments -> organizations
ALTER TABLE departments RENAME TO organizations;
ALTER TABLE organizations
    ADD COLUMN type       VARCHAR(20) NOT NULL DEFAULT 'COLLEGE'
                          CHECK (type IN ('COLLEGE', 'COMPANY')),
    ADD COLUMN status     VARCHAR(20) NOT NULL DEFAULT 'APPROVED'
                          CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN created_at TIMESTAMP   NOT NULL DEFAULT now();

-- 2. roles: DEPT_HEAD -> ORG_CONTACT, FACULTY -> MEMBER, new ADMIN role
ALTER TABLE users DROP CONSTRAINT users_role_check;
UPDATE users SET role = 'ORG_CONTACT' WHERE role = 'DEPT_HEAD';
UPDATE users SET role = 'MEMBER'      WHERE role = 'FACULTY';
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('ADMIN', 'ORG_CONTACT', 'MEMBER'));
ALTER TABLE users RENAME COLUMN department_id TO organization_id;

-- 3. equipment belongs to an organization; the old status flag is replaced by unavailable_periods
ALTER TABLE equipment RENAME COLUMN department_id TO organization_id;
ALTER TABLE equipment DROP COLUMN status;

-- 4. unavailable date windows set by the college (maintenance, repairs, etc.)
CREATE TABLE unavailable_periods (
    id            BIGSERIAL PRIMARY KEY,
    equipment_id  BIGINT       NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    start_date    DATE         NOT NULL,
    end_date      DATE         NOT NULL,
    reason        VARCHAR(200) NOT NULL DEFAULT '',
    CHECK (end_date >= start_date)
);
CREATE INDEX idx_unavailable_equipment ON unavailable_periods (equipment_id);
