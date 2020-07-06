FROM node:14 as builder
RUN curl -sf https://gobinaries.com/tj/node-prune | sh
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --no-cache
COPY . .
RUN yarn build
RUN yarn install --frozen-lockfile --no-cache --production
RUN /usr/local/bin/node-prune

FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules
EXPOSE ${PORT:-80}
CMD [ "node", "./dist/server.js" ]
