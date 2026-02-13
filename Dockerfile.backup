# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Build argument for API key
ARG REACT_APP_GEMINI_API_KEY
ENV REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Debug: Print env var (first 10 chars only for security)
RUN echo "Building with REACT_APP_GEMINI_API_KEY: ${REACT_APP_GEMINI_API_KEY:0:10}..."

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/build ./build
COPY --from=build /app/index.js ./
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 