FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY . .

# Installing Python 3 and installing library
RUN apt-get update && apt-get install python3-pip -y
RUN pip3 install numpy pandas
EXPOSE 8080
CMD [ "npm", "start" ]