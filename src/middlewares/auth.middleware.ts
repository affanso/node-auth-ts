import type { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import type { IResponse, IRole } from "../types/index";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login.",
        data: null,
      } as IResponse);
    }

    // Expected format:
    // Authorization: Bearer ACCESS_TOKEN

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
        data: null,
      } as IResponse);
    }

    const token = parts[1];

    // Verify access token
    const data = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret,
    ) as {
      id: string;
      role: string;
    };

    // Store user information in request
    req.id = data.id;
    req.role = data.role;

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        data: null,
      } as IResponse);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        data: null,
      } as IResponse);
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    } as IResponse);
  }
};

export const verifyRole = (...allowedRoles: IRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.role as IRole)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to perform this action",
        data: null,
      } as IResponse);
    }

    next();
  };
};
