# SSR frontend: build client + server bundles, then run server.js on the built dist/.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_API_URL (browser -> API) is baked in here, from the build arg: compose.yaml (local) or CI.
# .env is not copied into the image (.dockerignore).
ARG VITE_API_URL
ARG VITE_TURNSTILE_SITEKEY
ENV VITE_API_URL=${VITE_API_URL} VITE_TURNSTILE_SITEKEY=${VITE_TURNSTILE_SITEKEY}
RUN npm run build-only

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./
USER node
EXPOSE 5173
CMD ["node", "server.js"]
