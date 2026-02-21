import { Router } from "express";
import { sendFriendReqHandler } from "../services/user/send-friend-req";
import { middleware } from "../middleware";
import { createGameHandler } from "../services/user/create-game";

export const userRouter = Router();

userRouter.post("/friend-request", middleware, sendFriendReqHandler);
userRouter.post("/game", middleware, createGameHandler);