FROM node:22-alpine3.22

WORKDIR /app

COPY package*.json ./

RUN npm install -g pm2 pnpm

RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "pm2.ecosystem.config.js"]


