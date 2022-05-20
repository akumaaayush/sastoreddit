import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
    allowGlobalContext: true,
    entities: [Post, User],
    type: 'postgresql',
    dbName: 'redditdb',
    user: 'sastoreddit',
    password: 'reddit321',
    debug: !__prod__,
    migrations: {
        path: path.join(__dirname, './migrations'), 
        pathTs: undefined, 
        glob: '!(*.d).{js,ts}',
    }
} as Parameters<typeof MikroORM.init>[0];
