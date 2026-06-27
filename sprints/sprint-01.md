# Sprint 1

**Goal**: Authentication foundation, multi-tenancy scaffolding, Ticket CRUD API, Pest feature tests.

**Duration**: 10:40 AM – 12:01 PM IST

## Issue List

| # | Title | Status |
|---|-------|--------|
| 1 | Database migrations (all tables) | Shipped |
| 2 | Organization model + BelongsToTenant trait + TenantScope | Shipped |
| 3 | User model with role enum + Sanctum auth (register/login/logout) | Shipped |
| 4 | Ticket model + TicketController (CRUD) + TicketPolicy | Shipped |
| 5 | Pest feature tests: TenantIsolationTest, TicketCrudTest | Shipped |

## What Shipped

- All 8 migrations running cleanly on MySQL 8
- BelongsToTenant trait applies a global Eloquent scope — no manual `where` needed in controllers
- Sanctum token auth: register creates org + user, login returns token, logout revokes it
- Ticket CRUD restricted by TicketPolicy: admins/agents can update; only admin can delete; customers can create and view their own
- TenantIsolationTest: 4 assertions proving Org A cannot access Org B tickets
- TicketCrudTest: 10 assertions covering create, read, update, delete with correct auth

## What Slipped

Nothing from this sprint scope slipped.

## PR

PR #1 — merged to main by human at 12:01 PM IST.
