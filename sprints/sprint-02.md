# Sprint 2

**Goal**: Comment threading, ticket filters/search, SLA policies, activity logging, React frontend (auth + list + detail).

**Duration**: 12:05 PM – 2:08 PM IST

## Issue List

| # | Title | Status |
|---|-------|--------|
| 6 | CommentController (create/list) with is_internal gating | Shipped |
| 7 | Ticket filters (status, priority, assignee) + text search | Shipped |
| 8 | SlaPolicy model + breach computation | Shipped |
| 9 | ActivityLog helper writes on every mutation | Shipped |
| 10 | React frontend — auth, ticket list, ticket detail | Shipped |

## What Shipped

- Comment list filters out internal notes for customer role
- Ticket index accepts `?status=`, `?priority=`, `?assignee_id=`, `?search=` params
- SLA breach computed as `created_at + resolution_minutes < now()` and surfaced on ticket show
- ActivityLog::record() writes to activity_logs on every ticket status change, assignment change, and comment
- React SPA: AuthContext (token in localStorage), Axios client (Bearer), Login, Register, TicketsPage (filterable table + search), TicketDetailPage (conversation thread with public/internal toggle)

## What Slipped

Nothing from this sprint scope slipped.

## PR

PR #2 — merged to main by human at 2:08 PM IST.
