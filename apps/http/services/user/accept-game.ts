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

    const { gameId } = data;

    const totalPlayers = await prisma.gamePlayer.findMany({
      where: { gameId },
    });

    if (totalPlayers.length === 2) {
      return responsePlate({
        res,
        message: "Game is already full",
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

    await prisma.$transaction(async (tx) => {
      console.log("creating the in game player");
      await tx.gamePlayer.create({
        data: {
          gameId: game.id,
          userId,
        },
      });

      console.log("updating user's status who accepts the game");
      await tx.user.update({
        where: { id: userId },
        data: { status: "PLAYING" },
      });

      console.log("updating the other user's status also");
      await tx.user.update({
        where: { id: game.createdBy },
        data: { status: "PLAYING" },
      });
    });

    return responsePlate({
      res,
      message: "game accepted successfully",
      status: 201,
      data: { gameId },
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
