# FinTrack

> Personal finance tracker — full-stack portfolio project built with ASP.NET Core 9 and React/TypeScript.

**[Live Demo →](https://fintrack-eight-beta.vercel.app/login)**

---

## Demo Account

Want to explore without signing up?

| Field    | Value               |
|----------|---------------------|
| E-mail   | `demo@fintrack.app` |
| Password | `demo123`           |

The demo account has pre-loaded transactions and budgets for 2025 and 2026 so every chart and feature is visible immediately.

---

## Features

- **JWT Authentication** — register and login with hashed passwords (BCrypt); token stored in `localStorage`
- **Transactions** — create, edit, and delete income/expense entries filtered by month and year
- **Categories** — custom income and expense categories; 11 defaults created automatically on register
- **Budgets** — monthly spending limits per category with animated progress bars and over-budget warnings
- **Dashboard** — summary cards with animated counters, annual area chart with gradient fills, expense breakdown pie chart, and budget vs. actual section
- **Responsive UI** — works on desktop and mobile; consistent dark theme throughout

---

## Tech Stack

| Layer      | Technology                                               |
|------------|----------------------------------------------------------|
| Backend    | ASP.NET Core 9 (Controllers), Dapper                     |
| Database   | PostgreSQL (hosted on [Neon](https://neon.tech))         |
| Auth       | JWT Bearer tokens, BCrypt password hashing               |
| API Docs   | Swagger / OpenAPI                                        |
| Frontend   | React 19, TypeScript, Vite                               |
| Styling    | Tailwind CSS v4                                          |
| Animations | Framer Motion                                            |
| Charts     | Recharts (AreaChart + PieChart)                          |
| Routing    | React Router v7                                          |
| Deploy     | Render (backend) + Vercel (frontend)                     |

---

## Architecture

```
fintrack/
├── backend/
│   └── FinTrack.API/
│       ├── Controllers/        # Auth, Categories, Transactions, Budgets
│       ├── Services/           # Business logic (interfaces + implementations)
│       ├── Repositories/       # Dapper data access (interfaces + implementations)
│       ├── Models/             # Domain entities
│       ├── DTOs/               # Request/response contracts
│       └── Infrastructure/     # DB initializer, Dapper type handlers
└── frontend/
    └── src/
        ├── pages/              # Dashboard, Transactions, Login, Register
        ├── components/         # Layout, Modal
        ├── services/           # API calls (auth, categories, transactions, budgets)
        ├── contexts/           # AuthContext (JWT + user state)
        └── types/              # Shared TypeScript interfaces
```

The backend follows a layered architecture: Controllers → Services → Repositories. All database access uses Dapper with parameterized queries — no ORM.

---

## Running Locally

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- PostgreSQL running on `localhost:5432`

### 1 — Database

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

API starts at `https://localhost:7088`. Swagger UI is at `/swagger`.

### 3 — Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
VITE_API_URL=https://localhost:7088/api
```

```bash
npm run dev
```

App runs at `http://localhost:5173`.

---

## Deploying Your Own Instance

### Backend → Render

1. Create a free account at [render.com](https://render.com)
2. **New → Web Service** → connect your GitHub repository
3. Set **Root Directory** to `backend/FinTrack.API`, **Build Command** to `dotnet publish -c Release -o out`, **Start Command** to `dotnet out/FinTrack.API.dll`
4. Add environment variables:
   - `ConnectionStrings__DefaultConnection` — your PostgreSQL connection string (Neon free tier recommended)
   - `Jwt__Secret` — any random string with 32+ characters
   - `AllowedOrigin` — your Vercel frontend URL

### Frontend → Vercel

1. Create a free account at [vercel.com](https://vercel.com)
2. **Add New Project** → import this repository
3. Set **Root Directory** to `frontend`
4. Add environment variable (enable for **Production**, **Preview**, and **Development**):
   - `VITE_API_URL` — your Render backend URL + `/api` (e.g. `https://your-api.onrender.com/api`)
5. Deploy

---

## API Reference

All endpoints except Auth require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/auth/register` | Create account, get JWT  |
| POST   | `/api/auth/login`    | Login, get JWT           |

```json
// Request body (register includes "name")
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "secret" }

// Response
{ "token": "eyJ...", "name": "Ada Lovelace", "email": "ada@example.com" }
```

### Categories

| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | `/api/categories`      | List all categories  |
| POST   | `/api/categories`      | Create category      |
| PUT    | `/api/categories/{id}` | Update category      |
| DELETE | `/api/categories/{id}` | Delete category      |

### Transactions

| Method | Endpoint                              | Description                   |
|--------|---------------------------------------|-------------------------------|
| GET    | `/api/transactions?month=4&year=2026` | List transactions for period  |
| POST   | `/api/transactions`                   | Create transaction            |
| PUT    | `/api/transactions/{id}`              | Update transaction            |
| DELETE | `/api/transactions/{id}`              | Delete transaction            |
| GET    | `/api/transactions/summary?year=2026` | Monthly income/expense totals |

```json
// Create / Update body
{
  "amount": 1500.00,
  "type": "income",
  "categoryId": 1,
  "description": "Salary",
  "date": "2026-04-01"
}
```

### Budgets

| Method | Endpoint                           | Description             |
|--------|------------------------------------|-------------------------|
| GET    | `/api/budgets?month=4&year=2026`   | List budgets for period |
| POST   | `/api/budgets`                     | Create budget           |
| PUT    | `/api/budgets/{id}`                | Update budget           |
| DELETE | `/api/budgets/{id}`                | Delete budget           |

---

## Default Categories

11 categories are seeded automatically when a new account is created:

**Income:** Salário · Freelance · Investimentos · Outros

**Expense:** Alimentação · Transporte · Moradia · Saúde · Educação · Lazer · Outros
