import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { acceptFriendReqSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const acceptFriendReqHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { success, data, error } = acceptFriendReqSchema.safeParse(req.body);

    if (!success) {
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    const { otherUserId, status } = data;

    const friendToBe = await prisma.user.findFirst({
      where: { id: otherUserId },
    });

    if (!friendToBe) {
      return responsePlate({
        res,
        message: "User not found",
        status: 404,
      });
    }

    const isReqExist = await prisma.friendsMapUser.findUnique({
      where: {
        receiverId_senderId: {
          receiverId: userId,
          senderId: otherUserId,
        },
      },
    });

    if (!isReqExist) {
      return responsePlate({
        res,
        message: "Friend request not found",
        status: 404,
      });
    }

    await prisma.friendsMapUser.update({
      where: { id: isReqExist.id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    return responsePlate({
      res,
      message: `Friend request successfully ${status}`,
      status: 201,
      data: {
        otherUserId
      }
    });
  } catch (e) {
    console.log("error in acceptFriendReqHandler ", e);
    return responsePlate({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};
