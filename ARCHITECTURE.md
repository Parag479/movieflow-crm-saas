# System Architecture - MovieFlow CRM SaaS

## Overview

MovieFlow CRM SaaS is engineered as an enterprise multi-tenant application designed to scale across thousands of concurrent movie distributors, theater operators, and sales personnel.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|         Next.js 14 App Router | React 18 | Tailwind CSS | shadcn/ui               |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             AUTHENTICATION & ROUTING                              |
|           JWT Middleware | Tenant Context Extractor | RBAC Guard                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             BUSINESS LOGIC & API LAYER                            |
|  - Auth Service      - Movie Catalog        - Theater Management                  |
|  - Deal Engine       - Scheduling Engine    - Payment & Invoicing                 |
|  - CRM Pipeline      - AI Insights Suite    - Reports Generator                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                 DATA ACCESS LAYER                                 |
|                       Prisma ORM | PostgreSQL Database                            |
+-----------------------------------------------------------------------------------+
```

## Security & Multi-Tenancy Design
1. **Tenant Isolation**: Every database table includes a `companyId` key indexed for strict row-level isolation.
2. **Role-Based Access Control**: Standardized permissions mapped to 8 enterprise roles.
3. **Data Protection**: Hashed passwords with bcrypt, HTTP-only JWT cookies, CSRF protection, and audit logging.
