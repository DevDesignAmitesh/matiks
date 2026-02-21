import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { otpVerifySchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";
import { sign } from "jsonwebtoken";

export const verifyOtpHandler = async (req: Request, res: Response) => {
  try {
    const { success, data, error } = otpVerifySchema.safeParse({
      ...req.body,
      ...req.params,
    });

    if (!success) {
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    const { email, otp } = data;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (!existingUser) {
      return responsePlate({
        res,
        message: "user not found, please create account",
        status: 404,
      });
    }

    const existingOtp = await prisma.otp.findFirst({
      where: { email },
    });

    if (!existingOtp) {
      return responsePlate({
        res,
        message: "user not found, please create account",
        status: 404,
      });
    }

    if (otp.trim() !== existingOtp.value) {
      return responsePlate({
        res,
        message: "invalid OTP",
        status: 403,
      });
    }

    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

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
