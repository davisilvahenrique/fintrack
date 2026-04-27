# FinTrack

Personal finance tracker — portfolio project built with ASP.NET Core 9 + React/TypeScript.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core 9, Dapper, PostgreSQL |
| Auth | JWT Bearer + BCrypt |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| API Docs | Swagger / OpenAPI |

## Features

- **Auth** — register & login with JWT
- **Categories** — income/expense categories (11 defaults on register)
- **Transactions** — CRUD with monthly filter
- **Budgets** — monthly spending limits per category
- **Dashboard** — summary cards, annual bar chart, category pie chart, budget vs actual

## Running Locally

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/) running on `localhost:5432`

### 1 — Database

Create the database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE fintrack;"
psql -U postgres -d fintrack -f backend/database/schema.sql
```

### 2 — Backend

Create `backend/FinTrack.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=fintrack;Username=postgres;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-at-least-32-chars"
  }
}
```

```bash
cd backend
dotnet run --project FinTrack.API
```

API runs at `https://localhost:7088` — Swagger at `/swagger`.

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Deploy

### Backend → Render

1. Create a free account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Click **New → Blueprint** and select this repo — Render will detect `render.yaml`
4. Set the following environment variables in the Render dashboard:
   - `ConnectionStrings__DefaultConnection` — your PostgreSQL connection string (create a free PostgreSQL instance on Render)
   - `Jwt__Secret` — any random string with 32+ characters
   - `AllowedOrigin` — your Vercel frontend URL (e.g. `https://fintrack.vercel.app`)

### Frontend → Vercel

1. Create a free account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` — your Render backend URL + `/api` (e.g. `https://fintrack-api.onrender.com/api`)
5. Deploy

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account + get JWT |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/transactions?month=4&year=2026` | List transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/summary?year=2026` | Monthly totals for year |
| GET | `/api/budgets?month=4&year=2026` | List budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
