import { signupAndSigninSchema, zodErrorMessage } from "@repo/common/common";
import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { prisma } from "@repo/db/db";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";

export const loginHandler = async (req: Request, res: Response) => {
  try {
    console.log("login started")
    const { data, success, error } = signupAndSigninSchema.safeParse(req.body);

    if (!success) {
      console.log("zod error ", zodErrorMessage({ error }))
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    console.log("req.body validated");

    const { email, password } = data;

    const exisitngUser = await prisma.user.findFirst({
      where: { email },
    });

    console.log("finding user")

    if (!exisitngUser) {
      console.log("user not found")
      return responsePlate({
        res,
        message: "user not found",
        status: 404,
      });
    }

    console.log("user found")

    if(!exisitngUser.isVerified) {
      console.log("user is not verified")
      return responsePlate({
        res,
        message: "user is not verified, please signup",
        status: 403
      })
    }

    console.log("comparing password")
    const isPasswordCorrect = await compare(password, exisitngUser.password)

    
    if (!isPasswordCorrect) {
      console.log("password is incorrect")
      return responsePlate({
        res,
        message: "invalid password",
        status: 403,
      });
    }

    console.log("generating token")
    const token = sign({ userId: exisitngUser.id }, process.env.JWT_SECRET!);

    return responsePlate({
      res,
      message: "login successfull",
      data: { token },
      status: 200,
    });
  } catch (e) {
    console.log("error in loginHandler ", e);
  }
};
