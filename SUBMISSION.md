# PulseDesk — Submission Checklist

## Repo
- [x] Repo is public: `github.com/yuvrajsingh64/forge2-yuvrajsingh`
- [x] Repo name matches `forge2-<name>` format
- [x] Fresh repo created today — no pre-built PulseDesk features

## Code
- [x] Laravel 11 backend in `backend/`
- [x] MySQL 8 migrations + seeders present
- [x] React 19 + Vite + Tailwind frontend in `frontend/`
- [x] `backend/.env.example` present (no real secrets)
- [x] `frontend/.env.example` present
- [x] `php artisan migrate --seed` runs cleanly
- [x] `php artisan test` — all tests pass
- [x] Multi-tenant isolation verified (cross-tenant 404 — records hidden by TenantScope)
- [x] Seeded demo data: 1 org, 1 admin, 2 agents, 2 customers, 12 tickets

## Agent Configs
- [x] `agents/hermes/hermes-config.yaml` — real config, secrets redacted to `${ENV}`
- [x] `agents/openclaw/openclaw.json` — real config, secrets redacted to `${ENV}`
- [x] Both configs point to EastRouter with valid model IDs

## Agent Loop Evidence
- [x] `agent-log.md` — real human→Hermes→OpenClaw loop in chronological order
- [x] `sprints/sprint-01.md` — goal, issues, outcome
- [x] `sprints/sprint-02.md` — goal, issues, outcome
- [x] `sprints/sprint-03.md` — goal, issues, outcome

## Slack Evidence
- [x] `slack-export/screenshots/sprint-main-01.png` through `sprint-main-03.png`
- [x] `slack-export/screenshots/agent-coder-01.png` through `agent-coder-03.png`
- [x] `slack-export/screenshots/agent-log-01.png` through `agent-log-03.png`
- [x] `slack-export/screenshots/ci-cd-01.png`
- [x] `slack-export/screenshots/human-review-01.png`

## App Screenshots
- [x] `evidence/screenshots/01-login.png`
- [x] `evidence/screenshots/02-ticket-list.png`
- [x] `evidence/screenshots/03-ticket-detail.png`
- [x] `evidence/screenshots/04-dashboard.png`
- [x] `evidence/screenshots/05-openclaw-running.png`
- [x] `evidence/screenshots/06-ci-green.png`

## CI/CD
- [x] `.github/workflows/ci.yml` committed
- [x] At least one green CI run on GitHub Actions tab

## Documentation
- [x] `README.md` — stack, exact run steps, models used, live URL
- [x] `ARCHITECTURE.md` — data model, API routes, multi-tenancy approach

## Rules
- [x] Solo work built during the event
- [x] All model calls through EastRouter
- [x] No real secrets committed
- [x] All evidence committed in-repo (no external links)
- [x] I am the PR merge actor; agents opened PRs
