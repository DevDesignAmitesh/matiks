import { Router } from "express";
import { sendFriendReqHandler } from "../services/user/send-friend-req";
import { middleware } from "../middleware";
import { createGameHandler } from "../services/user/create-game";
import { acceptFriendReqHandler } from "../services/user/accept-friend-req";

export const userRouter = Router();

userRouter.post("/friend-request-send", middleware, sendFriendReqHandler);
userRouter.post("/friend-request-accept", middleware, acceptFriendReqHandler);
userRouter.post("/game", middleware, createGameHandler);