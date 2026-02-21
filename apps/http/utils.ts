import type { Response } from "express";

interface ResponsePlateProps {
  res: Response;
  message: string;
  data?: any;
  status: number;
}

export const responsePlate = ({
  res,
  message,
  data,
  status,
}: ResponsePlateProps) => {
  return res.status(status).json({
    message,
    data,
  });
};
