# Project Management Backend

A NestJS backend for authentication and project management workflows, built with PostgreSQL, Prisma, Swagger, and rate limiting.

## Overview

This repository contains a simple backend service with:

- user registration and login endpoints
- JWT authentication
- Prisma ORM for PostgreSQL access
- Swagger API documentation
- global request throttling via NestJS throttler
- environment-based configuration using `@nestjs/config`

## Running the project

Install dependencies and start in development mode:

```bash
pnpm install
pnpm run start:dev
```

By default the app listens on the value from `PORT` in `.env`, or `3000` if not set.

## API documentation with Swagger

Swagger is enabled in `src/main.ts`.

- Swagger UI is served at `/api`
- The global API prefix is also `/api`
- Schema metadata is generated from DTOs and controller decorators

### Swagger setup in the app

The following code is used to create the Swagger document:

- `DocumentBuilder()` sets title, description, version, and tags.
- `SwaggerModule.createDocument(app, config)` builds the OpenAPI spec.
- `SwaggerModule.setup('api', app, documentFactory)` serves the UI.

### Swagger decorators used

- `@ApiTags('Auth')` groups endpoints under the Auth section.
- `@ApiOperation()` adds summary and description to each route.
- `@ApiCreatedResponse()`, `@ApiOkResponse()`, `@ApiConflictResponse()`, `@ApiUnauthorizedResponse()` annotate response behavior.
- `@ApiProperty()` and `@ApiPropertyOptional()` describe request payload fields in DTOs.

### Example documented endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## How Prisma is integrated

Prisma is wired into the Nest app through a dedicated service and module.

- `src/prisma/prisma.module.ts` exports `PrismaService`.
- `src/prisma/prisma.service.ts` extends `PrismaClient`.
- Database connection is configured using `DATABASE_URL` from environment variables.
- The service connects on module initialization and disconnects on shutdown.
- `AuthService` injects `PrismaService` to query and create `user` records.

## Environment variables

This app uses `.env` values loaded by `ConfigModule.forRoot()`.

Example `.env.example`:

```env
DATABASE_URL="postgresql://appuser:appsecret@localhost:5432/appdb?schema=public"
PORT=3000
JWT_SECRET="super-secret-jwt-key"
THROTTLE_SHORT_TTL=1000
THROTTLE_SHORT_LIMIT=3
THROTTLE_MEDIUM_TTL=10000
THROTTLE_MEDIUM_LIMIT=20
THROTTLE_LONG_TTL=60000
THROTTLE_LONG_LIMIT=100
```

## Rate limiting

Rate limiting is configured globally in `src/app.module.ts` using `ThrottlerModule` and `ThrottlerGuard`.

- `ThrottlerModule.forRootAsync()` loads limits from environment variables.
- Named throttle windows are defined for `short`, `medium`, and `long` usage patterns.
- `APP_GUARD` applies `ThrottlerGuard` to every route in the application.

Because the guard is global, all incoming requests are evaluated against the configured limits before controller logic executes.

## Authentication flow

- `AuthModule` registers `JwtModule` with secret from `JWT_SECRET`.
- `AuthService.register()` checks existing users, hashes passwords with `bcrypt`, and saves new users through Prisma.
- `AuthService.login()` validates credentials, signs JWT tokens, and returns both `accessToken` and `refreshToken`.
- Validation is enforced globally using `ValidationPipe` with `whitelist: true`.

## Useful scripts

```bash
pnpm run build
pnpm run start
pnpm run test
pnpm run test:e2e
pnpm run lint
```

## Notes

- Swagger documentation is generated from controller routes and DTO schemas.
- Prisma is the single source of database access in the app.
- Rate limiting is active globally, protecting all endpoints automatically.
