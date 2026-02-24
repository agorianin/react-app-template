FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist

EXPOSE 8080
CMD ["node", "server-dist/index.js"]
