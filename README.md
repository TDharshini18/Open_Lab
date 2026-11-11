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


## Project layout

```
openlabs-app/
├── backend/    Spring Boot API (see backend/README.md for endpoints)
└── frontend/   Angular app
```
