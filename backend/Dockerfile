# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 5555

# Copy .env file
COPY .env .env

RUN npm install pm2 -g

# Command to run your application
CMD ["pm2-runtime", "index.js"]