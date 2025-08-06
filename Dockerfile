# Lightweight Node.js v20 image
FROM node:20-alpine

# File inside the image containing de source code
WORKDIR /app

# Files that will be copied 
COPY package*.json .

# Once you have the .config files run npm install as always
RUN npm install

# To clone the source code as it is
COPY . .

# Execute the application as always
CMD [ "node" , "app.js"]