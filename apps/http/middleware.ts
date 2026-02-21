import type { NextFunction, Request, Response } from "express";
import { responsePlate } from "./utils";
import { verify } from "jsonwebtoken";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return responsePlate({
        res,
        message: "un-authorized",
        status: 401,
      });
    }

    const bearerToken = token.split("Bearer ")[1];

    if (!bearerToken) {
      return responsePlate({
        res,
        message: "un-authorized",
        status: 401,
      });
    }

    const decoded = verify(bearerToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (!decoded.userId) {
      return responsePlate({
        res,
        message: "un-authorized",
        status: 401,
      });
    }

    req.user = decoded;
    next();
  } catch (e) {
    console.log("error in  middleware ", e);
    return responsePlate({
      res,
      message: "un-authorized",
      status: 401,
    });
  }
};
