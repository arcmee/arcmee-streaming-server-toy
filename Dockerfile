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

# Copy source code
COPY ./src ./src

# Expose port
EXPOSE 4000

# Command to run the application in development
CMD ["npm", "run", "dev"]
