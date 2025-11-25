# Base Image
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# Copy source code and Prisma schema
COPY ./src ./src
COPY ./prisma ./prisma

# Generate Prisma client at build time
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Command to run the application in development
CMD ["npm", "run", "dev"]
