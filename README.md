# FinTrack

Personal finance tracker built as a portfolio project.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 9, Dapper, SQL Server |
| Frontend | React, TypeScript |
| Auth | JWT Bearer |
| Docs | Swagger / OpenAPI |

## Project Structure

```
fintrack/
├── backend/
│   └── FinTrack.API/       # REST API
│       ├── Controllers/
│       ├── Services/
│       ├── Repositories/
│       ├── Models/
│       └── DTOs/
└── frontend/               # React app (coming soon)
```

## Modules

- **Auth** — register and login with JWT
- **Categories** — manage income/expense categories
- **Transactions** — record and list financial transactions
- **Budget** — set monthly spending limits per category
- **Dashboard** — monthly summary with charts

## Running locally

### Backend

```bash
cd backend/FinTrack.API
dotnet run
```

> Requires SQL Server. Update the connection string in `appsettings.json`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
