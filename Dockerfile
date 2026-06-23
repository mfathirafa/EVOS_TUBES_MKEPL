# ─── Stage 1: Base ───────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files terlebih dahulu (layer caching)
COPY package*.json ./

# Install production dependencies saja
RUN npm ci --only=production

# Copy source code
COPY src ./src

# ─── Runtime config ───────────────────────────────────────
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check setiap 30 detik
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" \
  || exit 1

# Jalankan aplikasi
CMD ["node", "src/app.js"]
