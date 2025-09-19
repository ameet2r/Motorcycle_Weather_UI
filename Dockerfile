# ==============================
# Stage 1: Build the frontend
# ==============================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (clean and reproducible)
RUN npm ci

# Copy all source code
COPY . .

# ------------------------------
# Build-time environment variables
# ------------------------------
# ARG variables must match the VITE_ prefix for Vite
ARG VITE_BACKEND_API

# Export them so npm build sees them
ENV VITE_BACKEND_API=$VITE_BACKEND_API

# Build the app
RUN npm run build

# ==============================
# Stage 2: Serve with Nginx
# ==============================
FROM nginx:alpine

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Railway expects
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]