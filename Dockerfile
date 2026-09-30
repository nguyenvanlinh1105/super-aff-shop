# ─── BƯỚC 1: MÔI TRƯỜNG CƠ SỞ (BASE) ───
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# ─── BƯỚC 2: CÀI ĐẶT THƯ VIỆN (DEPS) ───
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── BƯỚC 3: XÂY DỰNG ỨNG DỤNG (BUILDER) ───
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Sinh mã Prisma Client cho Linux Alpine
RUN npx prisma generate

# Xây dựng Next.js ở chế độ standalone
RUN npm run build

# ─── BƯỚC 4: RUNNER CHẠY PRODUCTION ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cài đặt OpenSSL cho Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Tạo user an toàn không dùng root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Tạo thư mục uploads và phân quyền ghi cho user nextjs
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

# Sao chép các tệp tĩnh và bundle standalone từ builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
