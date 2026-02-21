import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { sendFriendReqSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const sendFriendReqHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { data, success, error } = sendFriendReqSchema.safeParse(req.body);

    if (!success) {
      return responsePlate({
        res,
        message: "invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    const { otherUserId } = data;

    const friendToBe = await prisma.user.findFirst({
      where: { id: otherUserId },
    });

    if (!friendToBe) {
      return responsePlate({
        res,
        message: "user not found",
        status: 404,
      });
    }

    const alreadyFriends = await prisma.friendsMapUser.findUnique({
      where: {
        receiverId_senderId: {
          receiverId: otherUserId,
          senderId: userId,
        },
      },
    });

    if (alreadyFriends) {
      if (alreadyFriends.status === "ACCEPTED") {
        return responsePlate({
          res,
          message: "already friends",
          status: 400,
        });
      } else if (alreadyFriends.status === "PENDING") {
        return responsePlate({
          res,
          message: "request already sent",
          status: 201,
        });
      } else if (alreadyFriends.status === "IGNORED") {
        await prisma.friendsMapUser.update({
          where: {
            receiverId_senderId: {
              receiverId: otherUserId,
              senderId: userId,
            },
          },
          data: {
            status: "PENDING",
          },
        });
      }
      return responsePlate({
        res,
        message: "request sent again",
        status: 201,
      });
    }

    await prisma.friendsMapUser.create({
      data: {
        receiverId: otherUserId,
        senderId: userId,
        requestedAt: new Date(),
      },
    });

    return responsePlate({
      res,
      message: "friend request sent",
      status: 201,
      data: {
        // TODO: maybe something
      },
    });
  } catch (e) {
    console.log("error in friendReqHandler ", e);
    return responsePlate({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};
