import type { Request, Response } from "express";
import { responsePlate } from "../../utils";
import { createGameSchema, zodErrorMessage } from "@repo/common/common";
import { prisma } from "@repo/db/db";

export const createGameHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.user;
    const { data, success, error } = createGameSchema.safeParse(req.body);

    if (!success) {
      return responsePlate({
        res,
        message: "invalid inputs",
        status: 403,
        data: zodErrorMessage({ error }),
      });
    }

    const { mode, numberOfPlayers, timeLimit, type } = data;

    const game = await prisma.game.create({
      data: {
        mode,
        numberOfPlayers,
        timeLimit,
        type,
        createdBy: userId,
      },
    });

    // TODO: we have to create questions for this game.

    await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { status: "SEARCHING" },
    });

    return responsePlate({
      res,
      message: "game created successfully",
      status: 201,
      data: {
        gameId: game.id,
      },
    });
  } catch (e) {
    console.log("error in createGameHandler ", e);
    return responsePlate({
      res,
      message: "internal server error",
      status: 500,
    });
  }
};
