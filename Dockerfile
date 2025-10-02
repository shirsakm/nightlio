# Build stage (Debian-based to ensure native binaries resolve on all arches)
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Copy only package.json to allow arch-specific optional dependencies (Rollup) to resolve
COPY package.json ./

# Install dependencies (npm install resolves optional deps for current arch)
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build argument for API URL (empty string for relative paths in Docker)
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-bookworm

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Set configuration env vars that can be passed to nginx and their default values
ENV NGINX_ENVSUBST_FILTER="API_URL|PORT"
ENV API_URL="http://api:5000"
ENV PORT=80

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
