# Sprint 3

**Goal**: Dashboard metrics, notification system, full demo seeder, React dashboard page, notification center.

**Duration**: 2:12 PM – 4:11 PM IST

## Issue List

| # | Title | Status |
|---|-------|--------|
| 11 | DashboardController — metrics aggregation | Shipped |
| 12 | NotificationController + notification writes | Shipped |
| 13 | DatabaseSeeder — full demo data | Shipped |
| 14 | React DashboardPage with metric cards | Shipped |
| 15 | React NotificationCenter (bell + dropdown) | Shipped |

## What Shipped

- Dashboard returns: ticket counts by status, ticket counts by priority, avg first response time (minutes), SLA breach rate (%), daily created count for last 7 days
- Notifications created on ticket assignment and public comment; NotificationController returns user's notifications with unread count
- Seeder: Acme Corp org, admin@acmedemo.com, agent1@acmedemo.com, agent2@acmedemo.com, customer1@acmedemo.com, customer2@acmedemo.com, 12 tickets with varied status/priority/tags and 2–3 comments each
- DashboardPage: 4 KPI cards + daily volume bar chart
- NotificationCenter: bell icon with unread badge, click-to-expand dropdown, mark-as-read on click

## What Slipped

- CSV export — scoped out (no sprint time remaining)
- Real-time WebSocket updates — replaced with 30s polling
- CSAT rating — stretch feature, not started

## PR

PR #3 — merged to main by human at 4:11 PM IST.
