# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy env file from root
COPY .env .env

# Copy webapp package files
COPY data/webapp/package*.json ./

RUN npm install

# Copy the webapp source
COPY data/webapp .

# Build Next.js
RUN npm run build


# Stage 2: Runner
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]