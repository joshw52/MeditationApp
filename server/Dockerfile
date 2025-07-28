# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

# Copy the rest of the source files into the image.
COPY package*.json ./

run npm install

COPY . .

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application as a non-root user.
# RUN chown -R node:node /app
# USER node

# Run the application.
CMD npm start
