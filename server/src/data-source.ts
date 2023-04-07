import path from "path";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Upvote } from "./entities/Upvote";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "sastoreddit",
  password: "reddit321",
  database: "redditdb",
  synchronize: true,
  logging: true,
  entities: [Post, User, Upvote],
  subscribers: [],
  migrations: [path.join(__dirname, "./migrations/*"),],
});
