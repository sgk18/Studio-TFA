---
name: admin-dashboard-skill
description: 'Use when building admin dashboards, analytics views, CRUD tables, exports, pagination, invoices, and operational control panels.'
---

# Admin Dashboard Skill

## Purpose
Build professional admin panels for business control and analytics.

## Use When
- Creating dashboards, charts, and KPI cards
- Building CRUD tables and dialogs
- Adding server-side pagination and search
- Exporting data as CSV or spreadsheet files
- Managing orders, users, products, and invoices

## Core Modules
- Dashboard summary cards
- Revenue and trend charts
- Tables with search, filtering, and pagination
- Lazy loaded dialogs and forms
- Invoice and print actions
- Export actions

## Rules
- Prefer server-side pagination for large datasets
- Keep table and form state predictable
- Use skeletons while data loads
- Avoid overfetching and unnecessary re-renders
- Keep actions and permissions explicit
- Present admin UI like a professional SaaS tool

## Workflow
1. Identify the admin task and target data.
2. Define list, detail, and action surfaces.
3. Add loading and error states.
4. Wire pagination, filters, and exports.
5. Verify access control and data integrity.