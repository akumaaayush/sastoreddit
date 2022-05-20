import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    [OptionalProps]?: "updateAt" | "createdAt";

    @Field()
    @PrimaryKey()
    id!: number;

    @Field(() => String)
    @Property({ type: 'text' })
    title!: string;

    @Field(() => String)
    @Property({ type: 'date' })
    createdAt?: Date = new Date();

    @Field(() => String)
    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt?: Date = new Date();

}