FROM node:9.4.0-alpine
COPY app.js .
COPY providers.json .
COPY package.json .
RUN npm install &&\
    apk update &&\
    apk upgrade &&\
    apk add curl
EXPOSE  8081
CMD node app.js
