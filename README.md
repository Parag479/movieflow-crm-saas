# MovieFlow CRM SaaS

Enterprise-Grade Movie Distribution & Theater Management SaaS Platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma**, and **PostgreSQL**.

---

## Key Features

- **Multi-Tenant Architecture**: Complete data isolation, company branding, and user role management.
- **Executive Dashboard**: Real-time revenue KPIs, active movies, deal tracking, and analytics.
- **Movie Catalog Management**: Detailed movie profiles, cast/crew, genres, territories, and gallery assets.
- **Theater & Screen Allocation**: Multi-screen specs, seating capacities, and format support (2D, 3D, IMAX, 4DX).
- **Distributor Hub**: GST/PAN details, bank accounts, compliance documentation, and MOU management.
- **CRM & Kanban Pipeline**: Opportunity tracking, task management, notes, and interactive stage movements.
- **Deal Builder & PDF Agreements**: Revenue Share, Minimum Guarantee (MG), dynamic PDF contract generation.
- **Show Scheduling Engine**: Visual calendar grid with automated screen conflict detection algorithms.
- **Payments & GST Invoicing**: Ledger, automated CGST/SGST/IGST breakdown, dynamic invoice generation.
- **Executive Reports**: Box Office revenue analysis, theater yield statements, and PDF/Excel exporting.
- **Notifications Hub**: In-app bell notifications, email webhooks, and WhatsApp/SMS integration hooks.
- **Subscription Engine**: Starter, Professional, and Enterprise SaaS tier management with feature gating.
- **AI Insights Suite**: Revenue forecasting engine, movie demand predictor, and theater recommendation AI.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend API**: Next.js API Routes, Prisma ORM, PostgreSQL.
- **Auth & Security**: JWT Authentication, Refresh Tokens, RBAC, Multi-tenant Isolation middleware.
- **Deployment**: Docker, Docker Compose, Nginx, GitHub Actions CI/CD.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
```bash
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture and design patterns.
- [DATABASE.md](./DATABASE.md) - Database ERD, table definitions, and constraints.
- [API.md](./API.md) - REST API endpoints specification and validation schemas.
- [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) - Live phase execution status.
- [CHANGELOG.md](./CHANGELOG.md) - System version updates and change history.
