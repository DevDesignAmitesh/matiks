import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { friendReqSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const sendFriendReqHandler = async (req: Request, res: Response) => {
  try {
    console.log("send friend request started");
    const { userId } = req.user;
    const { data, success, error } = friendReqSchema.safeParse(req.body);

    if (!success) {
      console.log("zod error ", zodErrorMessage({ error }))
      return responsePlate({
        res,
        message: "invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    console.log("data validated")
    const { otherUserId } = data;

    console.log("finding the other person")
    const friendToBe = await prisma.user.findFirst({
      where: { id: otherUserId },
    });

    if (!friendToBe) {
      console.log("other person not found")
      return responsePlate({
        res,
        message: "user not found",
        status: 404,
      });
    }

    console.log("checking if they are already friends")
    const alreadyFriends = await prisma.friendsMapUser.findUnique({
      where: {
        receiverId_senderId: {
          receiverId: otherUserId,
          senderId: userId,
        },
      },
    });

    if (alreadyFriends) {
      console.log("they were already friends")
      if (alreadyFriends.status === "ACCEPTED") {
        console.log("status id already accepted")
        return responsePlate({
          res,
          message: "already friends",
          status: 400,
        });
      } else if (alreadyFriends.status === "PENDING") {
        console.log("status is pending")
        return responsePlate({
          res,
          message: "request already sent",
          status: 400,
        });
      } else if (alreadyFriends.status === "IGNORED") {
        console.log("status was ignored, now sent again")
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
        data: {
          otherUserId,
        }
      });
    }

    console.log("they are the latest friend");
    console.log("creating them in the db");
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
        otherUserId
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
