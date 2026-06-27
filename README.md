# PulseDesk

A multi-tenant customer support SaaS built for Forge 2 · Edition 1.

## Stack

- PHP 8.2 / Laravel 11 — REST API, Laravel Sanctum auth
- MySQL 8 — relational data store with per-tenant scoping
- React 19 + Vite — single-page frontend
- Tailwind CSS — utility-first styling
- Pest — feature test suite
- GitHub Actions — CI pipeline

## Models Used

- Hermes: `deepseek/deepseek-v4-pro` via EastRouter (sprint planning, issue decomposition)
- OpenClaw: `z-ai/glm-5.1` via EastRouter (implementation, tests, PRs)
- Cheap iterations: `z-ai/glm-4.5-air` via EastRouter (routine edits, doc updates)

All model calls routed through `https://api.eastrouter.com`.

## Run Steps (Local)

### Prerequisites

- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL 8 running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Tests

```bash
cd backend
php artisan test
```

## Seeded Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acmedemo.com | password |
| Agent | agent1@acmedemo.com | password |
| Agent | agent2@acmedemo.com | password |
| Customer | customer1@acmedemo.com | password |
| Customer | customer2@acmedemo.com | password |

Organization: Acme Corp (slug: `acmedemo`)

## What Shipped

- Full multi-tenant isolation — every query scoped by `organization_id` derived from the authenticated session
- Auth (register/login/logout) with role-based access: admin, agent, customer
- Tickets CRUD with status, priority, requester, assignee, tags
- Threaded conversation (public replies + internal agent notes)
- Ticket list with filters (status, priority, assignee) and text search
- SLA policies per priority with breach detection
- Dashboard metrics (open/pending counts, SLA breach rate, daily volume)
- Activity log per ticket
- In-app notification centre
- Seeder with 1 org, 1 admin, 2 agents, 2 customers, 12 varied tickets

## What Slipped

- Real-time websocket updates (polling at 30s instead)
- CSV export
- Ticket merge
- CSAT rating

## Live URL

Deployed on Railway — see SUBMISSION.md for URL once available.

## Notes

Multi-tenancy is enforced server-side only. The `organization_id` is derived exclusively from `auth()->user()->organization_id`. No client-supplied tenant identifier is trusted. Cross-tenant probe: authenticated as Org A, requesting `/api/tickets/{id}` belonging to Org B returns `403`.
