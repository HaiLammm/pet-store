# Stage 1: Build the application
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run the application
CMD ["node", "dist/server.js"]
