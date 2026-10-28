# Dockerfile for MovieFlow CRM SaaS
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client & Build Next.js application
RUN npx prisma generate
RUN npm run build

# Production image runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/src ./src

EXPOSE 3000

CMD ["npm", "run", "start"]
