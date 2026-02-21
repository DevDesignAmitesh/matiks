import { signupAndSigninSchema, zodErrorMessage } from "@repo/common/common";
import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { prisma } from "@repo/db/db";
import { revision } from "bun";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { data, success, error } = signupAndSigninSchema.safeParse(req.body);

    if (!success) {
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    const { email, password } = data;

    const exisitngUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!exisitngUser) {
      return responsePlate({
        res,
        message: "user not found",
        status: 404,
      });
    }

    const isPasswordCorrect = await compare(password, exisitngUser.password)

    
    if (!isPasswordCorrect) {
      return responsePlate({
        res,
        message: "invalid password",
        status: 403,
      });
    }

    
    const token = sign({ userId: exisitngUser.id }, process.env.JWT_SECRET!);

    return responsePlate({
      res,
      message: "login successfull",
      data: {
        token,
      },
      status: 200,
    });
  } catch (e) {
    console.log("error in loginHandler ", e);
  }
};
