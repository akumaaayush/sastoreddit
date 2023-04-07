import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import "express-session";
import Redis from "ioredis";

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
};
