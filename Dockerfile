FROM node:alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY ./ ./
ENV NODE_ENV production
CMD ["npm", "run", "build"]

FROM nginx:stable-alpine as web
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder ./build /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]