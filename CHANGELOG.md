# Changelog - MovieFlow CRM SaaS

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-22

### Added
- Complete multi-tenant SaaS architecture supporting isolated company data, branding, and role-based access control (RBAC).
- Full database normalization via Prisma ORM with 18 entities (Company, User, Role, Permission, Movie, Theater, Screen, Distributor, Lead, Task, Deal, Agreement, Show, Payment, Invoice, Notification, AuditLog, Subscription).
- Executive Dashboard with Recharts visualization for box office revenue trends, genre split, and circuit occupancy.
- Company branding & multi-role User Management with security audit logging.
- Movie Catalog with poster gallery, cast & crew, territory rights, and release timelines.
- Theater & Multi-Screen Manager supporting 2D, 3D, IMAX, 4DX, and Dolby Atmos specifications.
- Distributor directory with GST/PAN tax credentials and bank settlement details.
- CRM Sales Pipeline with interactive 6-stage Kanban board, lead value tracking, and follow-ups.
- Deal builder & automated PDF Agreement contract generator with digital signature preview.
- Visual Show Scheduling engine with real-time automated screen conflict detection algorithms.
- Payments & GST Tax Invoicing engine (CGST 9% + SGST 9%) with dynamic printable invoice popups.
- Executive Reports hub with Excel (CSV) data exporter and printable PDF reports.
- Real-time Notification center with WhatsApp & SMS webhook integration structures.
- SaaS Subscription Plan tier management with feature gating (Starter, Professional, Enterprise).
- AI Insights Suite: Revenue Forecast model, Movie Demand Predictor, Theater Recommendation AI, and AI Executive Summary generator.
- Production infrastructure: Multi-stage Dockerfile, docker-compose.yml, Nginx reverse proxy configuration, and GitHub Actions CI/CD workflow.
