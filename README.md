# OpenLabs

Share lab equipment between colleges and companies.

- **Backend:** Spring Boot 3.3, Java 21, Spring Security with JWT, Spring Data JPA, Flyway, PostgreSQL
- **Frontend:** Angular 19 with Angular Material

## 1. Database

In the PostgreSQL shell (`psql -U postgres`), create a clean database. The seed data only loads into an empty one:

```sql
DROP DATABASE IF EXISTS openlabs;
CREATE USER openlabs WITH PASSWORD 'openlabs';   -- skip if the user already exists
CREATE DATABASE openlabs OWNER openlabs;
```

## 2. Backend

```powershell
cd backend
mvn spring-boot:run
```

Wait for `Started OpenLabsApplication`. API: http://localhost:8080

## 3. Frontend

In a second PowerShell window:

```powershell
cd frontend
npm install
npm start
```

Open http://localhost:4200

## Demo accounts (password: password123)

| Email | Role |
|---|---|
| admin@openlabs.local | Admin: approves registrations, creates admins |
| contact.riverside@openlabs.local | College contact: manages equipment, approves requests |
| contact.hilltop@openlabs.local | College contact |
| buyer@nova.local | Company member: browses and requests equipment |
| contact.greenfield@openlabs.local | College contact of a PENDING college: sign-in refused until approved |

## Try the full flow

1. Log in as **admin** → Registrations → Pending → approve **Greenfield College**.
2. Log in as **contact.greenfield** → add equipment → block some dates.
3. Log in as **buyer** → Browse → pick dates → Check dates → Send request.
4. Log in as the college contact → Requests → Approve.
5. Log in as the buyer → My requests shows it as approved.

## Project layout

```
openlabs-app/
├── backend/    Spring Boot API (see backend/README.md for endpoints)
└── frontend/   Angular app
```

Payment is not built yet. It will be a step after a request is approved.
