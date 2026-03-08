import { Router } from "express";
import { signupHandler } from "../services/auth/signup";
import { verifyOtpHandler } from "../services/auth/verify-otp";
import { loginHandler } from "../services/auth/login";

export const authRouter = Router();

authRouter.post("/signup", signupHandler);
authRouter.post("/verify-otp/:email", verifyOtpHandler);
authRouter.post("/login", loginHandler);
