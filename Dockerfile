FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src

RUN npm run build

# Copy SQL schema files to dist
RUN cp src/infrastructure/database/*.sql dist/infrastructure/database/

# Prune dev dependencies to prepare for production copy
RUN npm prune --production

FROM node:22-alpine

WORKDIR /usr/src/app

# Install tzdata for timezone support
RUN apk add --no-cache tzdata

COPY package*.json ./

# Copy production node_modules and built application
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

CMD ["npm", "start"]
