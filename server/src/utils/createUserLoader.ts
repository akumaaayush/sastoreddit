import Dataloader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

// A data loader takes a list of keys (in this instance, a list of objects of keys),
// and returns a list of corresponding entities - users  null in the same order as the given keys.
// Data loaders batches and caches database requests to avoid the N + 1 problem of
// fetching N requests for a single db query

export const createUserLoader = () =>
  new Dataloader<number, User>(async (userIds) => {
    const users = await User.findBy({ id: In(userIds as number[]) });
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);
    return sortedUsers;
  });
