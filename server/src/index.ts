import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import { AppDataSource } from "./data-source";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/posts";
import { UserResolver } from "./resolvers/user";
import { myContext } from "./types";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

async function main(): Promise<void> {
  AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
    })
    .catch((error) => console.log(error));

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
    context: ({ req, res }): myContext => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upvoteLoader: createUpvoteLoader(),
    }),
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
