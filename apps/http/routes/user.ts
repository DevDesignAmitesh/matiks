import { Router } from "express";
import { sendFriendReqHandler } from "../services/user/send-friend-req";
import { middleware } from "../middleware";
import { createGameHandler } from "../services/user/create-game";
import { acceptFriendReqHandler } from "../services/user/accept-friend-req";
import { acceptGameHandler } from "../services/user/accept-game";

export const userRouter = Router();

userRouter.post("/friend-request-send", middleware, sendFriendReqHandler);
userRouter.post("/friend-request-accept", middleware, acceptFriendReqHandler);
userRouter.post("/game-create", middleware, createGameHandler);
userRouter.post("/game-accept", middleware, acceptGameHandler);