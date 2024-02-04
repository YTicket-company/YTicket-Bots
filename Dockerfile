FROM node:18.18

WORKDIR /usr/src/app

COPY . .

ENTRYPOINT [ "npm", "run", "start"]