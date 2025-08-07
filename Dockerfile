# Lightweight Node.js v20 image
FROM node:20-alpine

# File inside the image containing de source code
WORKDIR /src

# Files that will be copied 
COPY src/package*.json ./

# Once you have the .config files run npm install as always
RUN npm install

# Uncomment on production (To create a docker img the code)
COPY src/ .

# Execute the application as always
CMD [ "node" , "app.js"]