# PHIN GO Commerce

Monorepo cho website quảng bá và bán hàng PHIN GO. Frontend deploy riêng lên Vercel, backend deploy riêng lên Render, database dùng Neon PostgreSQL qua Prisma.

## Cấu trúc

- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS.
- `apps/api`: Fastify API, TypeScript, build bằng `tsup` để deploy Render gọn.
- `packages/database`: Prisma schema, migrations, seed, Prisma client export cho backend.
- `packages/shared`: types, constants, zod schemas dùng chung cho web và api.

Frontend chỉ gọi backend qua `NEXT_PUBLIC_API_URL` và không import `@phingo/database`.

## Local Setup

1. Cài dependencies:

```bash
pnpm install
```

2. Copy env mẫu:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

3. Cấu hình Neon `DATABASE_URL` trong `.env` hoặc `apps/api/.env`.

4. Chuẩn bị Prisma:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

5. Chạy local:

```bash
pnpm dev
```

Web chạy ở `http://localhost:3000`, API chạy ở `http://localhost:4000`.

## Deploy Vercel

- Chọn project từ GitHub.
- Framework: `Next.js`.
- Root Directory: `apps/web`.
- Build Command: `pnpm build`.
- Output: mặc định của Next.js.
- Env:

```bash
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
```

Không cấu hình `DATABASE_URL` cho Vercel vì web không cần truy cập database trực tiếp.

## Deploy Render

Tạo Render Web Service từ GitHub và để root là root repo, không đặt Root Directory thành `apps/api` để workspace vẫn thấy `packages/database`.

Build Command:

```bash
pnpm install --frozen-lockfile && pnpm --filter @phingo/database db:generate && pnpm --filter @phingo/database db:deploy && pnpm --filter @phingo/api build
```

Start Command:

```bash
pnpm --filter @phingo/api start
```

Env:

```bash
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

Backend listen bằng `app.listen({ port, host: "0.0.0.0" })` và dùng `PORT` từ Render.

## Prisma + Neon

- Schema nằm tại `packages/database/prisma/schema.prisma`.
- Production migrate dùng `pnpm db:deploy`, tương ứng `prisma migrate deploy`.
- Local development dùng `pnpm db:migrate`.
- Backend import Prisma từ `@phingo/database`; frontend không import package này.

## Scripts Chính

- `pnpm dev`: chạy web và api qua Turborepo.
- `pnpm build`: build toàn monorepo.
- `pnpm build:web`: build frontend.
- `pnpm build:api`: build backend.
- `pnpm lint`: chạy lint.
- `pnpm db:generate`: generate Prisma client.
- `pnpm db:migrate`: migrate local.
- `pnpm db:deploy`: deploy migrations production.
- `pnpm db:seed`: seed dữ liệu mẫu.
