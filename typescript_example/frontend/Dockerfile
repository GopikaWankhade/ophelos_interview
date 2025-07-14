FROM node:slim AS builder
WORKDIR /app
COPY package*.json tsconfig.json next.config.ts ./
COPY postcss.config.mjs ./
COPY public ./public
COPY src ./src
RUN npm ci
RUN npm run build

FROM node:slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
