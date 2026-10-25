import type {
  ErrorRequestHandler,
  Response,
  Request,
  NextFunction,
} from "express";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
