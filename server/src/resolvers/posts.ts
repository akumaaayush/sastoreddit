import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { AppDataSource } from "../data-source";
import { Post } from "../entities/Post";
import { Upvote } from "../entities/Upvote";
import { isAuth } from "../middleware/auth";
import { myContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: myContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() post: Post,
    @Ctx() { upvoteLoader, req }: myContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const upvote = await upvoteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return upvote ? upvote.value : null;
  }

  //upvotes
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: myContext
  ) {
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;

    const upvote = await Upvote.findOne({ where: { postId, userId } });

    //the user has voted on the post before and they are changing their vote
    if (upvote && upvote.value !== realValue) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          update upvote
          set value = $1
          where "postId" = $2 and "userId" = $3
          `,
          [realValue, postId, userId]
        );

        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
          `,
          [2 * realValue, postId]
        );
      });
    }
    //if the user has never voted before
    else if (!upvote) {
      await AppDataSource.transaction(async (tm) => {
        await tm.query(
          `
          insert into upvote ("userId", "postId", value)
          values ($1, $2, $3)
          `,
          [userId, postId, realValue]
        );

        await tm.query(
          `
          update post 
          set points = points + $1
          where id = $2
          `,
          [realValue, postId]
        );
      });
    }

    // await Upvote.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });

    // await AppDataSource.query(
    //   `
    //   START TRANSACTION;

    //   insert into upvote ("userId", "postId", value)
    //   values (${userId}, ${postId}, ${realValue});

    //   update post
    //   set points = points + ${realValue}
    //   where id = ${postId};

    //   COMMIT;
    //   `
    // );

    // await Upvote.update(
    //   {
    //     id: postId as number
    //   },
    //   {}
    // );
    return true;
  }

  //get all posts query
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    //fetching 1 extra than what user's fetching 20 -> 21
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    // const qb = AppDataSource.getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy('p."createdAt"', "DESC") // lowercases the field so needs extra quotation
    //   .limit(realLimitPlusOne);

    // if (cursor) {
    //   qb.where('p."createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const voteStatus = await qb.select('"voteStatus"').where("p.id = postId");
    // const posts = await qb.getMany();

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await AppDataSource.query(
      `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
      replacements
    );
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }

  //single post query
  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id } });
  }

  //createpost mutation
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: myContext
  ): Promise<Post> {
    //create post then save
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }

  //updatepost mutation
  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: myContext
  ): Promise<Post | null> {
    // COULDNT RETURN THE UPDATED POST
    // const post = await Post.findOne({ where: { id } });
    // if (!post) {
    //   return null;
    // }
    // if (typeof title !== "undefined") {
    //   await Post.update({ id, creatorId: req.session.userId}, { title, text });
    // }
    // return post;

    //using querybuilder to return the updated post
    const result = await AppDataSource.createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id =:id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  //deletepost mutation
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: myContext
  ): Promise<boolean> {
    const post = await Post.findOne({ where: { id } });

    if (!post) {
      return false;
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("Not authorized!");
    }

    await Upvote.delete({ postId: id });
    await Post.delete({ id });
    return true;

    //another method is adding cascade property on delete on Post entity
  }
}
