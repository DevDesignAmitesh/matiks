import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { signupAndSigninSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";
import { hash } from "bcryptjs";

export const signupHandler = async (req: Request, res: Response) => {
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

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return responsePlate({
        res,
        message: "User already exists",
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 4);
    const userName = email.split("@")[0];

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userName: userName ?? email,
      },
    });

    const emailOtpRes = await sendOtpToEmail({ email });

    if (!emailOtpRes.success) {
      return responsePlate({
        res,
        message: emailOtpRes.message,
        status: 400,
      });
    }

    return responsePlate({
      res,
      status: 201,
      message: `OTP has been sent to ${email}`,
    });
  } catch (e) {
    console.log("error in signupHandler ", e);
    return responsePlate({
      res,
      message: "Intenal server error",
      status: 500,
    });
  }
};
