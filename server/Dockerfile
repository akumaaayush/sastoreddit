FROM node:lts-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn config set "strict-ssl" false -g
RUN yarn 

COPY . ./

RUN ls -lsa

RUN yarn build

ENV NODE_ENV=production

EXPOSE 3000

# CMD [ "node", "./dist/index.js" ]
CMD [ "yarn", "dev" ]

USER node