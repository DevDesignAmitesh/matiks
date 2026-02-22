import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { otpVerifySchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";
import { sign } from "jsonwebtoken";

export const verifyOtpHandler = async (req: Request, res: Response) => {
  try {
    console.log("verify otp started");
    const { success, data, error } = otpVerifySchema.safeParse({
      ...req.body,
      ...req.params,
    });

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

    const { email, otp } = data;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!existingUser) {
      console.log("user not found returning");
      return responsePlate({
        res,
        message: "user not found",
        status: 404,
      });
    }

    console.log("user found");

    const existingOtp = await prisma.otp.findFirst({
      where: { identifier: email },
    });

    if (!existingOtp) {
      console.log("otp not found");
      return responsePlate({
        res,
        message: "otp's session not found",
        status: 404,
      });
    }

    console.log("comparing OTPs");
    const finalOtp =
      process.env.NODE_ENV === "development" ? "123456" : otp.trim();
      
    if (finalOtp !== existingOtp.value) {
      console.log("otp is invalid");
      return responsePlate({
        res,
        message: "Invalid OTP",
        status: 403,
      });
    }

    console.log("updating user with verified: true");
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    console.log("generating token");
    const token = sign({ userId: user.id }, process.env.JWT_SECRET!);

    return responsePlate({
      res,
      message: "OTP verified",
      data: { token },
      status: 201,
    });
  } catch (e) {
    console.log("error in verifyOtpHandler ", e);
    return responsePlate({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};
