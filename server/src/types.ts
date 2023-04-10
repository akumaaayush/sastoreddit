import { Request, Response } from "express";
import "express-session";
import { Session, SessionData } from "express-session";
import Redis from "ioredis";
import { createUpvoteLoader } from "./utils/createUpvoteLoader";
import { createUserLoader } from "./utils/createUserLoader";

declare module "express-session" {
  export interface Session {
    userId: number;
  }
}

export type myContext = {
  // em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Session & Partial<SessionData> };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  upvoteLoader: ReturnType<typeof createUpvoteLoader>;
};
