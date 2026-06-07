# ---- Build stage ----
# Compiles TypeScript and generates the Prisma client. Carries the full
# dependency tree (incl. the Prisma CLI) so the runtime stage can copy it.
FROM node:20-slim AS builder

# Prisma's query engine needs OpenSSL present to pick its native binary.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# Bring over the already-installed deps (with the generated Prisma client and
# the CLI used by `prisma migrate deploy` on boot) plus the compiled app.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Run as the unprivileged user the base image already ships.
USER node

# Cloud Run (and most PaaS) inject PORT; main.ts honours it, default 3000.
EXPOSE 3000

# Apply any pending migrations, then boot. Idempotent — safe on every deploy.
CMD ["npm", "run", "start:prod:migrate"]
