FROM node:20-alpine

WORKDIR /app

# Install Vite globally
RUN npm install -g vite

# Copy package.json (initial scaffolding will create it)
COPY package*.json ./

# Default command to start dev server
CMD ["vite", "--host", "0.0.0.0"]
