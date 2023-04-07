import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

//  user <-> posts
//  user -> upvote <- posts

@ObjectType()
@Entity()
export class Upvote extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  postId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.upvotes)
  user: User;

  @Field(() => Post)
  @ManyToOne(() => Post , (post) => post.upvotes)
  post: Post;
}