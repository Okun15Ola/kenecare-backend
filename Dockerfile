FROM node:19-alpine

LABEL Author="imotechsl"

WORKDIR /usr/src/app

COPY package*.json ./


RUN npm install


COPY . .

RUN npm install -g nodemon

EXPOSE 8000

CMD ["npm", "run", "start:dev"]