FROM node:slim

RUN apt-get update -y \
&& apt-get install -y openssl

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

COPY . .

RUN npm ci

CMD ["sh", "-c", "npm run db:deploy && npm run seed && npm run dev"]