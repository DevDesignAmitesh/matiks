import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { acceptFriendReqSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const acceptFriendReqHandler = async (req: Request, res: Response) => {
  try {
    console.log("accept friend request starts")
    const { userId } = req.user;
    const { success, data, error } = acceptFriendReqSchema.safeParse(req.body);

    if (!success) {
      console.log("zod error ", zodErrorMessage({ error }))
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    console.log("data validated")

    const { otherUserId, status } = data;

    console.log("finding the other user")
    const friendToBe = await prisma.user.findFirst({
      where: { id: otherUserId },
    });


    if (!friendToBe) {
      console.log("other user not found")
      return responsePlate({
        res,
        message: "User not found",
        status: 404,
      });
    }
    
    console.log("finding if the request exists or not");
    const isReqExist = await prisma.friendsMapUser.findUnique({
      where: {
        receiverId_senderId: {
          receiverId: userId,
          senderId: otherUserId,
        },
      },
    });

    if (!isReqExist) {
      console.log("request not found")
      return responsePlate({
        res,
        message: "Friend request not found",
        status: 404,
      });
    }

    console.log("updating the request with the status ", status)
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
