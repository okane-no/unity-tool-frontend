# -----------------------------
# 1) Build stage
# -----------------------------
FROM node:lts-alpine AS build
ARG API_BASE_EVENTLINK
ARG API_KEY_EVENTLINK
ARG API_BASE_UNITY
ARG API_KEY_UNITY
ARG APIKEY_PEPPER
WORKDIR /app

# System deps some packages expect
RUN apk add --no-cache libc6-compat

# Install deps (cache layer)
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

ENV API_BASE_EVENTLINK="$API_BASE_EVENTLINK"
ENV API_KEY_EVENTLINK="$API_KEY_EVENTLINK"
ENV API_BASE_UNITY="$API_BASE_UNITY"
ENV API_KEY_UNITY="$API_KEY_UNITY"
ENV APIKEY_PEPPER="$APIKEY_PEPPER"

# Copy source and build
COPY . .

# Inject commit/time coming from CI
ARG COMMIT_SHA=unknown
ARG BUILD_TIME
ENV COMMIT_SHA=$COMMIT_SHA
ENV BUILD_TIME=$BUILD_TIME

RUN npm run build

# -----------------------------
# 2) Runtime stage
# -----------------------------
FROM node:lts-alpine AS runtime
ARG API_BASE_EVENTLINK
ARG API_KEY_EVENTLINK
ARG API_BASE_UNITY
ARG API_KEY_UNITY
ARG APIKEY_PEPPER
WORKDIR /app
ENV NODE_ENV=production


 # Install only production deps required at runtime (from root package.json)
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built server from adapter-node
COPY --from=build /app/build ./build

# Run as non-root user provided by Node image
USER node

# SvelteKit adapter-node default port
ENV PORT=3000
EXPOSE 3000

ENV API_BASE_EVENTLINK="$API_BASE_EVENTLINK"
ENV API_KEY_EVENTLINK="$API_KEY_EVENTLINK"
ENV API_BASE_UNITY="$API_BASE_UNITY"
ENV API_KEY_UNITY="$API_KEY_UNITY"
ENV APIKEY_PEPPER="$APIKEY_PEPPER"

# Start server
CMD ["node", "build"]