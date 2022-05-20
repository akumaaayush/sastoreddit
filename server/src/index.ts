import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroConfig from './mikro-orm.config'
import express from 'express'
import helmet from 'helmet';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/posts';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { UserResolver } from './resolvers/user';
import * as redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { myContext } from './types';

async function main(): Promise<void> {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();

    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    const app = express();
    app.use(helmet({
        crossOriginEmbedderPolicy: __prod__,
        contentSecurityPolicy: __prod__,
    }));

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient({ legacyMode: true })
    await redisClient.connect().catch(err => console.log(err))

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,    // 1 day
                httpOnly: true,
                secure: __prod__,  //to be changed later
                sameSite: 'lax',
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
        context: ({ req, res }): myContext => ({ em: orm.em, req, res }),
        csrfPrevention: true,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
        introspection: !__prod__,
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app, path: "/graphql",
        // cors: {
        //     origin: "http://localhost:3000",
        //     credentials: true
        // }
    });

    console.log('-------------------SQL HERE-----------------------');
    // const post = orm.em.create(Post, { title: 'this is the first title' })
    // await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {});
    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}

main().catch(err => {
    console.log(err);
});