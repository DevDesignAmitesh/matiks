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

export const sendFriendReqSchema = z.object({
  otherUserId: z.uuid(),
});

export const createGameSchema = z.object({
  mode: z.enum(["ONLINE_SEARCH", "PLAY_WITH_FRIEND"]),
  type: z.enum(["BLITZ"]),
  timeLimit: z.number(),
  numberOfPlayers: z.number(),
});
