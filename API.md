# REST API Documentation - MovieFlow CRM SaaS

## API Standards

- Base URL: `/api`
- Content Type: `application/json`
- Authentication: `Bearer <JWT_TOKEN>` header or HTTP-only Session Cookie
- Standard Response Envelope:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Operation completed successfully",
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```

## Endpoint Categories

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user and issue JWT token pair.
- `POST /api/auth/register`: Register new company and initial admin account.
- `POST /api/auth/refresh`: Refresh expired JWT access token.
- `POST /api/auth/forgot-password`: Request password reset token.

### 2. Company & Users (`/api/company`, `/api/users`)
- `GET /api/company`: Retrieve current tenant company details.
- `PUT /api/company`: Update tenant settings, branding, and logo.
- `GET /api/users`: List tenant users with pagination, role filter, search.
- `POST /api/users`: Create new tenant user.

### 3. Movies & Theaters (`/api/movies`, `/api/theaters`)
- CRUD operations for Movies, Theaters, and Screens.

### 4. CRM & Deals (`/api/crm`, `/api/deals`)
- Lead status updates, Kanban pipeline movements, PDF Agreement generation.

### 5. Shows & Conflict Detection (`/api/shows`)
- Schedule show timings and run conflict detection check.

### 6. Payments & Reports (`/api/payments`, `/api/reports`)
- Record milestone payments, render invoices, compile box office reports.
