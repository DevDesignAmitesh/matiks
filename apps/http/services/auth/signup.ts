import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { signupAndSigninSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";
import { hash } from "bcryptjs";
import { emailService } from "@repo/email/email";

export const signupHandler = async (req: Request, res: Response) => {
  try {
    console.log("signup started");
    const { data, success, error } = signupAndSigninSchema.safeParse(req.body);

    if (!success) {
      console.log("zod error ", zodErrorMessage({ error }));
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    console.log("req.body validated");

    const { email, password } = data;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        console.log("user exists and also verified");
        return responsePlate({
          res,
          message: "User already exists, please login",
          status: 400,
        });
      } else if (!existingUser.isVerified) {
        console.log("user exists but not verified");
        const hashedPassword = await hash(password, 4);
        const userName = email.split("@")[0];

        console.log("updating users details with new info");
        const user = await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            userName: userName ?? email,
          },
        });

        if (process.env.NODE_ENV === "development") {
          console.log("otp is 123456 as of dev env");
          const minutes = 5;

          const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

          await prisma.otp.upsert({
            where: { identifier: user.email },
            update: {
              value: "123456",
              expiresAt,
            },
            create: {
              identifier: user.email,
              value: "123456",
              expiresAt,
            },
          });

          return responsePlate({
            res,
            status: 201,
            message: `OTP has been sent to ${email}`,
          });
        }

        const value = Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 10),
        )
          .join("")
          .trim();

        const minutes = 5;

        const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

        console.log("upserting otp");
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

        console.log("sending email");
        const emailOtpRes = await emailService.sendEmail({
          email: user.email,
          name: user.userName,
          otp: otp.value,
        });

        if (!emailOtpRes.success) {
          console.log("email not send");
          return responsePlate({
            res,
            message: "unable to send otp on " + email,
            status: 400,
          });
        }

        console.log("email sent");
        return responsePlate({
          res,
          status: 201,
          message: `OTP has been sent to ${email}`,
        });
      }
    }

    console.log("user not found, now creating one");

    const hashedPassword = await hash(password, 4);
    const userName = email.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userName: userName ?? email,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("otp is 123456 as of dev env");
      const minutes = 5;
      const value = "123456";
      const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

      await prisma.otp.upsert({
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

      return responsePlate({
        res,
        status: 201,
        message: `OTP has been sent to ${email}`,
      });
    }

    const value = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10),
    )
      .join("")
      .trim();

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

    console.log("upserting OTP");

    const emailOtpRes = await emailService.sendEmail({
      email: user.email,
      name: user.userName,
      otp: otp.value,
    });

    console.log("sending email");

    if (!emailOtpRes.success) {
      console.log("email failed");
      return responsePlate({
        res,
        message: "unable to send otp on " + email,
        status: 400,
      });
    }

    console.log("email sent with OTP", otp);

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
