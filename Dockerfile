FROM node:alpine as build

WORKDIR /app

COPY package*.json ./

RUN apk add --update npm

RUN npm install

COPY . .

CMD npm start

RUN npm run build

FROM nginx

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build /usr/share/nginx/html