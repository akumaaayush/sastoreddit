import DataLoader from "dataloader";
import { In } from "typeorm";
import { Upvote } from "../entities/Upvote";

export const createUpvoteLoader = () =>
  new DataLoader<{ userId: number; postId: number }, Upvote | null>(
    async (idObjArr) => {
      const userIds = idObjArr.map((obj) => obj.userId);
      const postIds = idObjArr.map((obj) => obj.postId);
      const upvotes = await Upvote.findBy({
        userId: In(userIds),
        postId: In(postIds),
      });

      const upvoteToIdMap: Record<string, Upvote> = {};
      upvotes.forEach((upvote) => {
        upvoteToIdMap[`${upvote.postId}|${upvote.userId}`] = upvote;
      });

      return idObjArr.map((obj) => {
        return upvoteToIdMap[`${obj.postId}|${obj.userId}`];
      });
    }
  );
