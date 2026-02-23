import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { acceptGameSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const acceptGameHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { data, success, error } = acceptGameSchema.safeParse(req.body);

    if (!success) {
      return responsePlate({
        res,
        message: "Invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    // TODO: we should also track that which users ignored this game so that next time if
    // we send the request of the same game again then these people should be skipped
    const { gameId } = data;

    const totalPlayers = await prisma.gamePlayer.findMany({
      where: {
        gameId,
      },
    });

    if (totalPlayers.length === 2) {
      return responsePlate({
        res,
        message: "Game is full",
        status: 400,
      });
    }

    const game = await prisma.game.findFirst({
      where: { id: gameId },
    });

    if (!game) {
      return responsePlate({
        res,
        message: "Game not found",
        status: 404,
      });
    }

    // TODO: add prisma.$transcation
    console.log("creating the in game player");
    await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId,
      },
    });

    console.log("updating user's status");
    await prisma.user.update({
      where: { id: userId },
      data: { status: "PLAYING" },
    });

    await prisma.user.update({
      where: { id: game.createdBy },
      data: { status: "PLAYING" },
    });

    return responsePlate({
      res,
      message: "game accepted successfully",
      status: 201,
      data: {
        gameId: game.id,
      },
    });
  } catch (e) {
    console.log("error in acceptGameHandler ", e);
    return responsePlate({
      res,
      message: "Internal server error",
      status: 500,
    });
  }
};
