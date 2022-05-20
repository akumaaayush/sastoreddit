import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { myContext } from "src/types";
import { User } from "../entities/User";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;      //field denoting either email/password "field"
    @Field()
    message: string;    //error message
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    //login with cookie?
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: myContext
    ) {
        if (!req.session.userId) {
            return null;
        }
        const user = await em.findOne(User, { id: req.session.userId })
        return user;
    }

    //register mutation
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() { em }: myContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'The username length must be greater than 2'
                    },
                ]
            }
        }
        if (options.password.length <= 4) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'The password length must be greater than 4'
                    },
                ]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { username: options.username, password: hashedPassword })
        try {
            await em.persistAndFlush(user)
        } catch (err) {
            //duplicate username error code
            if (err.code === '23505') { // or add .includes("already exists") lol hacks
                if (err.detail.includes('email')) {
                    return {
                        errors: [
                            {
                                field: "username",
                                message: "the username already exists"
                            }
                        ]
                    }
                }
            }
            console.log('Error message ', err.message)
        }
        return { user }
    }

    //login mutation
    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() { em, req }: myContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "that username doesn't exist."
                    }
                ]
            }
        }
        const valid = await argon2.verify(user.password, options.password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password."
                    }
                ]
            }
        }

        req.session.userId = user.id;
        return { user };
    }

    //get all users
    @Query(() => [User])
    async users(@Ctx() { em }: myContext): Promise<User[]> {
        return em.find(User, {})
    }
}
