# 🚀 Production-Ready Portfolio REST API

A high-performance, modular, and scalable Portfolio REST API engineered with **ElysiaJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. Containerized with **Docker** & **Docker Compose**, featuring **JWT Authentication** (with refresh token rotation and revocation), **Role-Based Access Control (RBAC)**, **Zod Validation**, **Helmet Security Headers**, **Sliding-Window Rate Limiting**, and interactive **Swagger/OpenAPI Documentation**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Folder Structure](#-folder-structure)
- [Database Models](#-database-models)
- [API Reference](#-api-reference)
- [Security Implementations](#-security-implementations)
- [Environment Variables](#-environment-variables)
- [Getting Started with Docker](#-getting-started-with-docker)
- [Local Development Setup](#-local-development-setup)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [Testing](#-testing)
- [Production Deployment Guide](#-production-deployment-guide)

---

## ✨ Features

- **Blazing Fast**: Powered by [Bun](https://bun.sh) and [ElysiaJS](https://elysiajs.com).
- **Clean Modular Architecture**: Separation of concerns (`config`, `database`, `modules`, `middleware`, `plugins`, `utils`).
- **Robust Authentication**:
  - Secure bcrypt password hashing.
  - Short-lived JWT Access Tokens (15m).
  - Rotated, revocable Refresh Tokens stored in PostgreSQL (7d).
  - Role-based authorization (`ADMIN` and `USER`).
- **Comprehensive Portfolio Endpoints**:
  - Full CRUD for **Projects**, **Skills**, **Experiences**, **Educations**, **Certificates**, and **Social Links**.
  - Public contact submission with anti-spam rate limiting and admin inbox management.
- **Advanced Query Features**:
  - Pagination (`page`, `limit`, `totalPages`, `hasNext`, `hasPrev`).
  - Search across titles, descriptions, and names.
  - Multi-attribute filtering (category, featured, read status).
  - Configurable sorting (`sortBy`, `sortOrder`).
- **Enterprise-Grade Security**:
  - Helmet-equivalent HTTP security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`).
  - Strict input validation using **Zod**.
  - In-memory sliding-window IP rate limiter.
  - SQL injection protection via Prisma ORM parameterized queries.
- **Standardized API Responses**:
  - Consistent envelope for success (`{ success: true, data, meta, message, timestamp }`).
  - Standardized error format (`{ success: false, error: { code, message, details }, timestamp }`).
- **Full OpenAPI / Swagger 3.0 UI**:
  - Accessible at `/swagger` with Bearer token authentication support.

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Bun v1.4+** | High-performance JavaScript/TypeScript runtime & package manager |
| **ElysiaJS v1.4+** | Fast, type-safe web framework |
| **TypeScript v7+** | Strongly typed code base with strict mode |
| **PostgreSQL 16** | Robust relational database |
| **Prisma ORM 6** | Type-safe database client and migrations |
| **Zod** | Runtime schema validation and TypeScript type inference |
| **JWT (@elysiajs/jwt)** | Stateless access tokens and refresh tokens |
| **bcryptjs** | One-way salted password hashing |
| **Swagger UI** | Interactive OpenAPI 3.0 API documentation |
| **Docker & Compose** | Multi-stage production containerization |

---

## 🏗 Project Architecture

The codebase follows Clean Architecture and Domain-Driven Modular principles:

```
[ HTTP Request ]
       │
       ▼
[ Security & Logger Middleware ]
       │
       ▼
[ Sliding-Window Rate Limiter ]
       │
       ▼
[ Auth Plugin (JWT Verification & User Derivation) ]
       │
       ▼
[ Module Route Handler (Zod Request Validation) ]
       │
       ▼
[ Service Layer (Business Logic & Transactions) ]
       │
       ▼
[ Database Layer (Prisma ORM Singleton -> PostgreSQL) ]
       │
       ▼
[ Standardized Response Formatter / Global Error Handler ]
```

---

## 📁 Folder Structure

```
portfolio-api/
├── prisma/
│   ├── migrations/
│   │   └── 0_init/
│   │       └── migration.sql      # Initial schema migration
│   ├── schema.prisma              # Prisma schema with 9 models & enums
│   └── seed.ts                    # Realistic database seed data
├── src/
│   ├── config/
│   │   └── index.ts               # Zod-validated environment configuration
│   ├── database/
│   │   └── client.ts              # Prisma client singleton with lifecycle hooks
│   ├── middleware/
│   │   ├── error.middleware.ts    # Global error handler (AppError, Prisma, Zod)
│   │   ├── logger.middleware.ts   # Request/response performance logger
│   │   ├── rate-limit.middleware.ts # In-memory sliding-window rate limiter
│   │   └── security.middleware.ts # Helmet security headers
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.schema.ts     # Register, login, refresh DTO schemas
│   │   │   ├── auth.service.ts    # Token generation, rotation, password verification
│   │   │   └── auth.routes.ts     # Auth endpoints
│   │   ├── users/
│   │   │   ├── users.schema.ts    # Profile update and query schemas
│   │   │   ├── users.service.ts   # User management logic
│   │   │   └── users.routes.ts    # /api/users endpoints
│   │   ├── projects/
│   │   │   ├── projects.schema.ts # Project validation schemas
│   │   │   ├── projects.service.ts# Project CRUD and slug generator
│   │   │   └── projects.routes.ts # /api/projects endpoints
│   │   ├── skills/
│   │   │   ├── skills.schema.ts
│   │   │   ├── skills.service.ts
│   │   │   └── skills.routes.ts
│   │   ├── experiences/
│   │   │   ├── experiences.schema.ts
│   │   │   ├── experiences.service.ts
│   │   │   └── experiences.routes.ts
│   │   ├── educations/
│   │   │   ├── educations.schema.ts
│   │   │   ├── educations.service.ts
│   │   │   └── educations.routes.ts
│   │   ├── certificates/
│   │   │   ├── certificates.schema.ts
│   │   │   ├── certificates.service.ts
│   │   │   └── certificates.routes.ts
│   │   ├── social-links/
│   │   │   ├── social-links.schema.ts
│   │   │   ├── social-links.service.ts
│   │   │   └── social-links.routes.ts
│   │   └── contacts/
│   │       ├── contacts.schema.ts
│   │       ├── contacts.service.ts
│   │       └── contacts.routes.ts
│   ├── plugins/
│   │   └── auth.plugin.ts         # JWT plugin, user extractor, and role guards
│   ├── types/
│   │   └── index.ts               # Common interfaces and API response contracts
│   ├── utils/
│   │   ├── error.ts               # Custom AppError classes
│   │   ├── password.ts            # bcrypt hash and compare functions
│   │   ├── query.ts               # Pagination and sort order parsers
│   │   ├── response.ts            # sendSuccess, sendPaginated, calculatePagination
│   │   ├── slug.ts                # URL slug generator
│   │   └── validation.ts          # Zod validator helper
│   ├── app.ts                     # Elysia app factory & route registration
│   └── index.ts                   # Server entry point & graceful shutdown
├── tests/
│   ├── unit/                      # Fast unit tests (slug, password, error, response)
│   └── integration/               # API endpoint tests (health, auth, validation)
├── .env.example                   # Environment configuration template
├── docker-compose.yml             # PostgreSQL & API production stack
├── Dockerfile                     # Multi-stage Bun production build
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## 🗄 Database Models

### 1. `User`
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password` (String, Hashed)
- `avatar` (String, Optional)
- `role` (Enum: `ADMIN`, `USER`)
- `createdAt`, `updatedAt` (DateTime)
- Relation: `refreshTokens` (One-to-Many cascade)

### 2. `RefreshToken`
- `id` (UUID, Primary Key)
- `token` (String, Unique, Indexed)
- `userId` (String, Foreign Key to `User`)
- `expiresAt` (DateTime)
- `revoked` (Boolean)
- `createdAt` (DateTime)

### 3. `Project`
- `id` (UUID, Primary Key)
- `title` (String)
- `slug` (String, Unique, Indexed)
- `description` (String)
- `content` (Text)
- `image` (String, Optional)
- `githubUrl` (String, Optional)
- `liveUrl` (String, Optional)
- `featured` (Boolean, Indexed)
- `technologies` (String Array)
- `createdAt`, `updatedAt` (DateTime)

### 4. `Skill`
- `id` (UUID, Primary Key)
- `name` (String)
- `category` (String, Indexed)
- `icon` (String, Optional)
- `proficiency` (Int, 1-100)
- `createdAt`, `updatedAt` (DateTime)

### 5. `Experience`
- `id` (UUID, Primary Key)
- `company` (String)
- `position` (String)
- `description` (Text)
- `startDate` (DateTime)
- `endDate` (DateTime, Optional)
- `current` (Boolean)
- `createdAt`, `updatedAt` (DateTime)

### 6. `Education`
- `id` (UUID, Primary Key)
- `school` (String)
- `degree` (String)
- `field` (String)
- `startDate` (DateTime)
- `endDate` (DateTime, Optional)
- `createdAt`, `updatedAt` (DateTime)

### 7. `Certificate`
- `id` (UUID, Primary Key)
- `title` (String)
- `issuer` (String)
- `issueDate` (DateTime)
- `credentialUrl` (String, Optional)
- `createdAt`, `updatedAt` (DateTime)

### 8. `SocialLink`
- `id` (UUID, Primary Key)
- `platform` (String)
- `url` (String)
- `createdAt`, `updatedAt` (DateTime)

### 9. `ContactMessage`
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String)
- `subject` (String)
- `message` (Text)
- `isRead` (Boolean, Indexed)
- `createdAt` (DateTime)

---

## 📡 API Reference

Interactive Swagger UI is available at `http://localhost:3000/swagger`.

### System
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Welcome banner and status |
| `GET` | `/api/health` | Public | API status, uptime, memory, and database connectivity |

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return access/refresh tokens |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token and issue new access token |
| `POST` | `/api/auth/logout` | Public | Revoke active refresh token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | Authenticated | Get current authenticated user profile |
| `PUT` | `/api/users/profile` | Authenticated | Update profile details and optional password change |
| `GET` | `/api/users` | Admin | List all registered users (paginated, search, role filter) |
| `GET` | `/api/users/:id` | Admin | Get user by ID |
| `PUT` | `/api/users/:id/role` | Admin | Promote or demote user role |
| `DELETE` | `/api/users/:id` | Admin | Remove user account |

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Public | List projects (pagination, search, featured, technology, sorting) |
| `GET` | `/api/projects/:id` | Public | Get project by UUID or slug |
| `POST` | `/api/projects` | Admin | Create project (auto-generates unique slug) |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |

### Skills (`/api/skills`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/skills` | Public | List skills (filter by category, sort by proficiency) |
| `GET` | `/api/skills/:id` | Public | Get skill by ID |
| `POST` | `/api/skills` | Admin | Create new skill |
| `PUT` | `/api/skills/:id` | Admin | Update skill |
| `DELETE` | `/api/skills/:id` | Admin | Delete skill |

### Experiences (`/api/experiences`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/experiences` | Public | List work experience chronologically |
| `GET` | `/api/experiences/:id` | Public | Get experience record by ID |
| `POST` | `/api/experiences` | Admin | Create experience entry |
| `PUT` | `/api/experiences/:id` | Admin | Update experience entry |
| `DELETE` | `/api/experiences/:id` | Admin | Delete experience entry |

### Educations (`/api/educations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/educations` | Public | List academic degrees chronologically |
| `GET` | `/api/educations/:id` | Public | Get education record by ID |
| `POST` | `/api/educations` | Admin | Create education record |
| `PUT` | `/api/educations/:id` | Admin | Update education record |
| `DELETE` | `/api/educations/:id` | Admin | Delete education record |

### Certificates (`/api/certificates`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certificates` | Public | List certifications |
| `GET` | `/api/certificates/:id` | Public | Get certificate by ID |
| `POST` | `/api/certificates` | Admin | Add new certificate |
| `PUT` | `/api/certificates/:id` | Admin | Update certificate |
| `DELETE` | `/api/certificates/:id` | Admin | Delete certificate |

### Social Links (`/api/social-links`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/social-links` | Public | List all social links |
| `GET` | `/api/social-links/:id` | Public | Get social link by ID |
| `POST` | `/api/social-links` | Admin | Add social link |
| `PUT` | `/api/social-links/:id` | Admin | Update social link |
| `DELETE` | `/api/social-links/:id` | Admin | Delete social link |

### Contacts (`/api/contact`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | Public | Submit message (Anti-spam rate-limited to 5/10min) |
| `GET` | `/api/contact` | Admin | List inquiries (pagination, search, filter by isRead) |
| `GET` | `/api/contact/:id` | Admin | Get message details and auto-mark as read |
| `PUT` | `/api/contact/:id/status`| Admin | Update message read/unread status |
| `DELETE` | `/api/contact/:id` | Admin | Delete message |

---

## 🔒 Security Implementations

1. **Password Hashing**: Cryptographic salt rounds via `bcryptjs`.
2. **Dual-Token JWT Security**:
   - Access token is short-lived (15 minutes).
   - Refresh token is stored securely in the database with rotation upon every refresh and revocation on logout.
3. **Helmet Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `Referrer-Policy: strict-origin-when-cross-origin`
4. **Sliding-Window Rate Limiting**:
   - Global rate limit (100 req/min).
   - Strict rate limit on contact form submissions (5 submissions per 10 minutes per IP).
   - Rate limit headers returned with every response (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).
5. **SQL Injection Protection**:
   - Parameterized queries with Prisma ORM.
6. **Input Validation**:
   - Strict type coercion and field validation with Zod on request body, query parameters, and URL parameters.

---

## ⚙️ Environment Variables

Create your `.env` file based on `.env.example`:

```env
# Application Environment
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# PostgreSQL Connection URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_db?schema=public

# JWT Authentication Secrets (Must be at least 16 characters in length)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_change_in_production_min_32_chars!
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_change_in_production_min_32_chars!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Policy (Comma-separated origins or * for all)
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Initial Admin Credentials (for seed script)
ADMIN_INITIAL_EMAIL=admin@portfolio.dev
ADMIN_INITIAL_PASSWORD=AdminPassword123!
```

---

## 🐳 Getting Started with Docker

Run the entire stack with a single command:

```bash
docker compose up -d --build
```

### What happens automatically:
1. Starts **PostgreSQL 16** with a persistent volume `portfolio_postgres_data`.
2. Waits until the PostgreSQL database passes health checks (`pg_isready`).
3. Builds the **API container** using the multi-stage `Dockerfile`.
4. Runs database schema synchronization (`prisma db push`).
5. Seeds the database with the default **Admin account**, **User account**, and portfolio items.
6. Starts the server at `http://localhost:3000`.

### View Logs:
```bash
docker compose logs -f api
```

### Stop Containers:
```bash
docker compose down
```

---

## 💻 Local Development Setup

If you prefer to run Bun directly on your host machine:

### 1. Prerequisites
- [Bun](https://bun.sh) (v1.4+)
- PostgreSQL running locally or via Docker (`docker run --name pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=portfolio_db -d postgres:16-alpine`)

### 2. Install Dependencies
```bash
bun install
```

### 3. Generate Prisma Client
```bash
bun run prisma:generate
```

### 4. Push Schema & Seed Database
```bash
bun run prisma:push
bun run prisma:seed
```

### 5. Start Development Server
```bash
bun run dev
```

The server will be available at:
- **API**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/swagger`
- **Health Check**: `http://localhost:3000/api/health`

### Pre-Seeded Credentials:
- **Admin**: `admin@portfolio.dev` / `AdminPassword123!`
- **User**: `user@portfolio.dev` / `UserPassword123!`

---

## 🧪 Testing

The test suite covers unit tests for utilities and integration tests for endpoints, validation, and authentication:

```bash
# Run all tests
bun test

# Run unit tests only
bun test tests/unit/

# Run integration tests only
bun test tests/integration/
```

---

## 🚀 Production Deployment Guide

### Option 1: VPS (Ubuntu / Debian + Systemd / Nginx)

1. **Clone repository and set up environment**:
   ```bash
   git clone <repo-url> /opt/portfolio-api
   cd /opt/portfolio-api
   cp .env.example .env
   # Edit .env with production credentials and secrets
   nano .env
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Configure Nginx Reverse Proxy with SSL (Certbot)**:
   ```nginx
   server {
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Generate Let's Encrypt certificate:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Option 2: PaaS (Coolify / Railway / Render)

1. Connect your Git repository.
2. Select **Dockerfile** as build pack.
3. Provision a **PostgreSQL** database addon or service.
4. Set environment variables:
   - `DATABASE_URL` (from provisioned PostgreSQL)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`
   - `PORT=3000`
5. Deploy! Healthcheck endpoint is `/api/health`.

---

## 📄 License

This project is licensed under the MIT License.
