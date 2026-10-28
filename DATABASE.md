# Database Documentation - MovieFlow CRM SaaS

## Overview

The database is built using **Prisma ORM** with **PostgreSQL**, fully normalized to 3NF standards with strict relational constraints, foreign keys, and indices.

## Core Schema Entities

1. **Company**: Multi-tenant organization profile, branding, and billing status.
2. **User**: System user linked to a `Company` with authentication credentials and `Role`.
3. **Role & Permission**: Dynamic RBAC definition and user assignments.
4. **Movie**: Film master record including metadata, cast, crew, poster, and territory rights.
5. **Theater & Screen**: Exhibition venue with address, owner contact, and multi-screen specs.
6. **Distributor**: Partner distribution company details, GST/PAN credentials, and documents.
7. **Lead, Task, Contact**: CRM entity tracking sales pipeline, meetings, and follow-ups.
8. **Deal & Agreement**: Business contract between Distributor/Production House and Theater Owner.
9. **Show**: Calendar show timings, screen allocations, ticket prices, and conflict locks.
10. **Payment & Invoice**: Financial transaction ledger with automatic CGST, SGST, IGST calculations.
11. **Notification & AuditLog**: Real-time alerts and security audit trails.
12. **Subscription**: SaaS tier limits, feature flags, and active plan metadata.
