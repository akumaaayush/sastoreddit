import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { myContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
  @Field()
  field: string; //field denoting either email/password "field"
  @Field()
  message: string; //error message
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  //credentials hiding
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: myContext) {
    //current user so show them their email
    if (req.session.userId === user.id) {
      return user.email;
    }

    //cant view others email
    return "";
  }

  //changepassword mutation
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { req, redis }: myContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 4) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "The password length must be greater than 4",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne({ where: { id: userIdNum } });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists.",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    //log in user after change password
    req.session.userId = user.id;
    return { user };
  }

  //forgetpassword mutation
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: myContext
  ) {
    const user = await User.findOne({ where: { email } });
    //when email doesnt exist in db
    if (!user) {
      console.log("asdhaujshduajhsdujahsdu");
      return true;
    }
    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3
    );
    await sendEmail(
      email,
      `<a href="http://localhost:8080/change-password/${token}"> Reset Password!</a>`
    );
    return true;
  }

  //login with cookie?
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: myContext) {
    if (!req.session.userId) {
      return null;
    }
    return User.findOne({ where: { id: req.session.userId } });
  }

  //register mutation
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { req }: myContext
  ): Promise<UserResponse> {
    //shape of error response is independent now
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await User.create({
        username: options.username,
        email: options.email,
        password: hashedPassword,
      }).save();
      // console.log("result: ", result);
      user = result as any;
    } catch (err) {
      //duplicate username error code
      if (err.code === "23505") {
        // or add .includes("already exists") lol hacks
        if (err.detail.includes("already exists")) {
          return {
            errors: [
              {
                field: "username",
                message: "The user with same credentials already exists!",
              },
            ],
          };
        }
      }
      console.log("Error message ", err.message);
    }
    req.session.userId = user.id;
    return { user };
  }

  //login mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: myContext
  ): Promise<UserResponse> {
    if (usernameOrEmail.length <= 0) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "please enter a username!",
          },
        ],
      };
    }
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist.",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password.",
          },
        ],
      };
    }

    req.session.userId = user.id;
    return { user };
  }

  //logout mutation
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: myContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }

  //get all users
  @Query(() => [User])
  async users(@Ctx() {}: myContext): Promise<User[]> {
    return User.find();
  }
}
