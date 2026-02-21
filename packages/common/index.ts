import z, { ZodError } from "zod";

export const zodErrorMessage = ({ error }: { error: ZodError }) => {
  return error.issues
    .map((er) => `${er.path.join(".")}: ${er.message}`)
    .join(", ");
};

export const signupAndSigninSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const otpVerifySchema = z.object({
  email: z.email(),
  otp: z.string(),
});

export const friendReqSchema = z.object({
  otherUserId: z.uuid(),
});

export const acceptFriendReqSchema = z.object({
  otherUserId: z.uuid(),
  status: z.enum(["PENDING", "ACCEPTED", "IGNORED"]),
});

export const createGameSchema = z.object({
  mode: z.enum(["ONLINE_SEARCH", "PLAY_WITH_FRIEND"]),
  type: z.enum(["BLITZ"]),
  timeLimit: z.number(),
  numberOfPlayers: z.number(),
});

export const MESSAGE_TYPE = {
  PING: "PING",
  PONG: "PONG",
  READY: "READY",
  GAME_ANSWER: "GAME_ANSWER",
  ROUND_STARTED: "ROUND_STARTED",
  GAME_STARTS: "GAME_STARTS",
  GAME_REQUEST: "GAME_REQUEST",
  GAME_ACCEPT: "GAME_ACCEPT",
  FRIEND_ACCEPT: "FRIEND_ACCEPT",
  SUBSCRIBE_ONLINE_USER: "SUBSCRIBE_ONLINE_USER",
  UN_SUBSCRIBE_ONLINE_USER: "UN_SUBSCRIBE_ONLINE_USER",
  ONLINE_USER: "ONLINE_USER",
  FRIEND_REQUEST: "FRIEND_REQUEST",
};
