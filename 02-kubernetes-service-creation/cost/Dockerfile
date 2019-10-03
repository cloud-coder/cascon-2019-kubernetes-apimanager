FROM node:9.4.0-alpine
COPY app.js .
COPY .env .
COPY package.json .
RUN npm install &&\
    apk update &&\
    apk upgrade &&\
    apk add curl
EXPOSE  8082
CMD node app.js
