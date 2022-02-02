# LTS version of node - FROM node:lts-alpine
# use current LTS version as of 2022.02 - node:16.13.2-alpine
FROM node:16.13.2-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# npm latest version needed for downloading packages
RUN npm install -g npm@latest

# needed for compiling serialport npm package
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers make python3 && \
    npm install --quiet node-gyp -g

RUN npm install --production && mv node_modules ../
COPY . .
EXPOSE 80
RUN chown -R node /usr/src/app

# use default user node for this image
USER node

# run json api server application -
CMD ["node", "build/json_api_server/app.js"]


# Build Image
# docker build -t weather_station_server:latest .

# Run Image in detached mode with port forwarding to port 3000 from image port 80
# docker run -d -p 3000:80 -e PORT=80 --name weatherStation --restart=on-failure weather_station_server:latest