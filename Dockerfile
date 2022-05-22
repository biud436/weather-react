FROM node:alpine

ENV PORT 3000

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY ./ ./

ENV NODE_ENV production

CMD ["npm", "run", "build"]