import { MiddlewareFn } from "type-graphql";
import { myContext } from "../types";

export const isAuth: MiddlewareFn<myContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated!asdasdasdasd");
  }
  return next();
};
