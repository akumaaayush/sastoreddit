import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import helmet from "helmet";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { myContext } from "./types";
import cors from "cors";
import { AppDataSource } from "./data-source";

async function main(): Promise<void> {
  AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error))

  // await Post.delete({});
  const app = express();
  app.use(
    helmet({
      crossOriginEmbedderPolicy: __prod__,
      contentSecurityPolicy: __prod__,
    })
  );

  app.use(
    cors({
      origin: "http://localhost:8080",
      credentials: true,
    })
  );

  const RedisStore = connectRedis(session);
  const redis = new Redis();
  // await redis.connect().catch(err => console.log(err))

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        secure: __prod__, //to be changed later
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: "osduhgpo1uh2oue1ou21291789asdas9",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): myContext => ({ req, res, redis }),
    csrfPrevention: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    introspection: !__prod__,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    cors: false,
  });

  console.log("-------------------SQL HERE-----------------------");
  app.listen(3000, () => {
    console.log("Listening on http://localhost:3000/graphql");
    console.log(redis.status);
  });
}

main().catch((err) => {
  console.log(err);
});
