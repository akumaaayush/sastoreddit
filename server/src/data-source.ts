import path from "path";
import { DataSource } from "typeorm";
// import { Post } from "./entities/Post";
// import { Upvote } from "./entities/Upvote";
// import { User } from "./entities/User";
import "dotenv-safe/config";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  // host: "localhost",
  // port: 5432,
  // database: "redditdb",
  // username: "postgres",
  // password: "postgres",
  // synchronize: true,
  logging: true,
  entities: ["dist/entities/*js"],
  subscribers: [],
  migrations: [path.join(__dirname, "./migrations/*")],
});
