FROM node:9.4.0-alpine
COPY app.js .
COPY accounts.json .
COPY package.json .
COPY views/ views/
RUN npm install &&\
    apk update &&\
    apk upgrade &&\
    apk add curl
EXPOSE  8080
CMD node app.js
