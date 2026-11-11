# OpenLabs backend (step 2: organizations, roles, unavailable dates)

Spring Boot 3.3 · Java 21 · Spring Security + JWT · Spring Data JPA · Flyway · PostgreSQL

## Before you run: reset the database

The old demo data uses the previous roles and doesn't include an admin, so the new seed
data only applies to an empty database. In the PostgreSQL shell (`psql -U postgres`):

```sql
DROP DATABASE openlabs;
CREATE DATABASE openlabs OWNER openlabs;
```

Flyway then runs V1 and V2 on the empty database, and `DataSeeder` creates the demo data.

## Run

```powershell
mvn spring-boot:run
```

## Demo accounts (password: password123)

| Email | Role | Organization |
|---|---|---|
| admin@openlabs.local | ADMIN | none |
| contact.riverside@openlabs.local | ORG_CONTACT | Riverside Institute of Technology (approved college) |
| contact.hilltop@openlabs.local | ORG_CONTACT | Hilltop Science College (approved college) |
| buyer@nova.local | MEMBER | Nova Electronics Pvt Ltd (approved company) |
| contact.greenfield@openlabs.local | ORG_CONTACT | Greenfield College (PENDING, sign-in blocked until approved) |

## Rules

- **Registration:** a college or company registers with a contact. The contact can't sign in until an admin approves it.
- **Admins:** approve or reject organizations, and create other admins.
- **College contact:** adds, lists, and deletes its own equipment (deletion is blocked once an item has any booking history). Marks unavailable date ranges. Approves or rejects incoming requests.
- **Company members:** browse equipment from approved colleges, check availability for a date range, and send booking requests.
- **Bookings:** whole days. Pending and approved requests block their dates. The database also enforces this with an exclusion constraint.
- **Payment:** not built yet. It will be a step after approval.

## Endpoints

| Method | Path | Who |
|---|---|---|
| POST | /api/auth/register-org | Anyone |
| POST | /api/auth/login | Anyone (approved accounts only) |
| GET | /api/admin/organizations?status=PENDING | Admin |
| PATCH | /api/admin/organizations/{id}/approve | Admin |
| PATCH | /api/admin/organizations/{id}/reject | Admin |
| POST | /api/admin/admins | Admin |
| GET | /api/equipment?category= | Company members (approved colleges' items) |
| GET | /api/equipment/mine | College contact |
| POST | /api/equipment | College contact |
| DELETE | /api/equipment/{id} | College contact (no booking history) |
| GET | /api/equipment/{id}/unavailable | Logged in |
| POST | /api/equipment/{id}/unavailable | College contact |
| GET | /api/equipment/{id}/availability?from=&to= | Logged in |
| POST | /api/bookings | Company members |
| GET | /api/bookings/mine | Logged in |
| GET | /api/bookings/incoming | College contact |
| PATCH | /api/bookings/{id}/approve | College contact |
| PATCH | /api/bookings/{id}/reject | College contact |
| PATCH | /api/bookings/{id}/cancel | Requester |
