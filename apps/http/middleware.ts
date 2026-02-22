import type { NextFunction, Request, Response } from "express";
import { responsePlate } from "./utils";
import { verify } from "jsonwebtoken";

export const middleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("middleware started");
    const token = req.headers.authorization;

    if (!token) {
      console.log("token not found")
      return responsePlate({
        res,
        message: "un-authorized",
        status: 401,
      });
    }

    const bearerToken = token.split("Bearer ")[1];

    if (!bearerToken) {
      console.log("bearer token not found")
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
      console.log("unable to decode users paylod")
      return responsePlate({
        res,
        message: "un-authorized",
        status: 401,
      });
    }

    console.log("got all the details and now running next ", decoded);
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
