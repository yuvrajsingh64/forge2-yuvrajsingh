# PulseDesk Architecture

## Multi-Tenancy Approach

Each tenant is an `Organization`. Every data model that belongs to a tenant carries an `organization_id` foreign key. A global Eloquent scope (`TenantScope`) is applied automatically on all scoped models via the `BelongsToTenant` trait. The `organization_id` is resolved from `auth()->user()->organization_id` on every authenticated request. No tenant identifier is accepted from the client.

The auth middleware pipeline:

```
Request → Sanctum token validation → User hydrated → TenantScope applied globally
```

All API routes are protected by `auth:sanctum`. The `TenantScope` trait on each model ensures that any query run after authentication is automatically filtered:

```
where organization_id = :user_org_id
```

Adversarial cross-tenant attempt: a valid Sanctum token belonging to Org A cannot retrieve, modify, or delete any record belonging to Org B because the global scope rewrites every query and Policies add a secondary `$ticket->organization_id === $user->organization_id` check.

## Data Model

```
organizations
  id (PK)
  name
  slug (unique)
  created_at, updated_at

users
  id (PK)
  organization_id (FK → organizations)
  name
  email (unique)
  password
  role  ENUM('admin','agent','customer')
  created_at, updated_at

tickets
  id (PK)
  organization_id (FK → organizations)
  subject
  description (text)
  status  ENUM('open','pending','resolved','closed')
  priority  ENUM('low','medium','high','urgent')
  requester_id (FK → users)
  assignee_id (FK → users, nullable)
  created_at, updated_at

ticket_tags
  id (PK)
  ticket_id (FK → tickets)
  name
  created_at, updated_at

comments
  id (PK)
  ticket_id (FK → tickets)
  user_id (FK → users)
  body (text)
  is_internal  BOOLEAN  (true = agent-only note)
  created_at, updated_at

sla_policies
  id (PK)
  organization_id (FK → organizations)
  priority  ENUM('low','medium','high','urgent')
  response_minutes  INT
  resolution_minutes  INT
  created_at, updated_at

activity_logs
  id (PK)
  ticket_id (FK → tickets)
  user_id (FK → users, nullable)
  action  VARCHAR
  metadata  JSON
  created_at

notifications
  id (PK)
  user_id (FK → users)
  type  VARCHAR
  data  JSON
  read_at  TIMESTAMP (nullable)
  created_at
```

## API Routes

All routes prefixed `/api/`. All protected by `auth:sanctum` except register and login.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /auth/register | public | Create account |
| POST | /auth/login | public | Get Sanctum token |
| POST | /auth/logout | any | Revoke token |
| GET | /tickets | admin,agent,customer | List tickets (tenant-scoped) |
| POST | /tickets | admin,agent,customer | Create ticket |
| GET | /tickets/{id} | admin,agent,customer | Get ticket detail |
| PUT | /tickets/{id} | admin,agent | Update ticket |
| DELETE | /tickets/{id} | admin | Delete ticket |
| GET | /tickets/{id}/comments | admin,agent,customer | List comments |
| POST | /tickets/{id}/comments | admin,agent,customer | Post comment |
| GET | /users | admin,agent | List org users |
| GET | /dashboard/metrics | admin,agent | Aggregate metrics |
| GET | /notifications | any | User notifications |
| PATCH | /notifications/{id}/read | any | Mark as read |
| GET | /sla-policies | admin | List SLA policies |
| POST | /sla-policies | admin | Create SLA policy |

## Key Design Decisions

1. **Sanctum tokens over sessions** — stateless API suitable for a decoupled React SPA. Tokens scoped per device.

2. **Global Eloquent scope** — `TenantScope` is applied in the model's `booted()` method. This means even raw ORM calls from within a command or job are tenant-safe without extra effort.

3. **Role-based via enum** — roles are an enum column on `users`. Policies check `$user->role` directly. This avoids a separate `roles` table for the scale of this application.

4. **Internal comments** — `is_internal` flag on `comments`. Customers receive comments filtered to `is_internal = false`. Agents/admins see all.

5. **SLA breach detection** — computed at query time. A breached ticket is one where `created_at + sla_policy.resolution_minutes < NOW()` and status is not `resolved` or `closed`.

6. **Activity log** — every status change, assignment change, and comment creation appends a record to `activity_logs`. The controller calls a helper that writes the log after each mutation.

## Sprint Decomposition

Three tight sprints managed by Hermes, implemented by OpenClaw:

- Sprint 1: Migrations, Models, Auth, Ticket CRUD, Tenant isolation, Pest tests
- Sprint 2: Comments, Tags, Filters/Search, SLA policies, Activity log, React frontend (auth + list + detail)
- Sprint 3: Dashboard metrics, Notifications, Seeder, React Dashboard + Notification center, CI polish
