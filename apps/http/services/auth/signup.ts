import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { signupAndSigninSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";
import { hash } from "bcryptjs";
import { emailService } from "@repo/email/email";

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

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userName: userName ?? email,
      },
    });

    const value = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    ).join("");

    const minutes = 5;

    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const otp = await prisma.otp.upsert({
      where: { identifier: user.email },
      update: {
        value,
        expiresAt,
      },
      create: {
        identifier: user.email,
        value,
        expiresAt,
      },
    });

    const emailOtpRes = await emailService.sendEmail({
      email: user.email,
      name: user.userName,
      otp: otp.value,
    });

    if (!emailOtpRes) {
      return responsePlate({
        res,
        message: "unable to send otp on " + email,
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
