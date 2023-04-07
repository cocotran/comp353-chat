# base image
FROM node:14

# create app directory
WORKDIR /app

# install app dependencies
COPY package*.json ./
RUN npm install

# copy server files
COPY . .

# expose port
EXPOSE 5000

# start the server
CMD [ "npm", "start" ]