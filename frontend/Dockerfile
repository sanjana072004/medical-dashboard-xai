# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

RUN addgroup -S appuser && adduser -S -G appuser -u 1001 appuser

COPY --from=builder --chown=appuser:appuser /app/package.json /app/package-lock.json ./
COPY --from=builder --chown=appuser:appuser /app/.next ./.next
COPY --from=builder --chown=appuser:appuser /app/public ./public
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules

USER appuser

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
