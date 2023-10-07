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
import "dotenv-safe/config";

async function main(): Promise<void> {
  AppDataSource.initialize()
    .then(() => {
      // here you can start to work with your database
      AppDataSource.runMigrations();
    })
    .catch((error) => console.log(error));

  // await Post.delete({});
  const app = express();
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      // contentSecurityPolicy: __prod__,
      contentSecurityPolicy: false,
    })
  );

  app.use(
    cors({
      origin: "http://localhost:8080",
      credentials: true,
    })
  );
  app.set("proxy", 1);

  const RedisStore = connectRedis(session);
  // const redis = new Redis(process.env.REDIS_URL);
  const redis = new Redis({ host: "redis" });
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
        // domain: "*", //set a domain
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
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
    // introspection: !__prod__,
    introspection: true,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: "/graphql",
    cors: false,
  });

  app.listen(parseInt(process.env.PORT), () => {
    console.log(`Listening on http://localhost:${process.env.PORT}/graphql`);
    console.log(redis.status);
  });
  // console.log("-------------------SQL HERE-----------------------");
}

main().catch((err) => {
  console.log(err);
});
