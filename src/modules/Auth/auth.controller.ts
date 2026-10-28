import { Request, Response } from "express";
import type { IResponse } from "../../types/index";
import { User } from "./user.modal";
import type { IUser } from "./user.modal";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET as Secret;

const ACCESS_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) ?? "15m";

const REFRESH_TOKEN_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"]) ?? "7d";

// =========================
// SIGN-UP
// =========================

export const signup = async (req: Request, res: Response) => {
  const { name, email, phone, username, password, role } = req.body;

  try {
    if (!name || !email || !phone || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
        data: null,
      } as IResponse);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email or username already exists",
        data: null,
      } as IResponse);
    }

    // Hash password
    const securePassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      username,
      password: securePassword,
      role,
    });

    // JWT payload
    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    // Create access token
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // Create refresh token
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Store refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          username: user.username,
          role: user.role,
        },
      },
    } as IResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message,
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

// =========================
// LOGIN
// =========================

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password",
        data: null,
      } as IResponse);
    }

    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      } as IResponse);
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      } as IResponse);
    }

    // Payload
    const payload = {
      id: user._id.toString(),
      role: user.role,
    };

    // Short-lived access token
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    // Long-lived refresh token
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Store refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
    } as IResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        message: error.message,
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

// =========================
// REFRESH TOKEN
// =========================

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from HttpOnly cookie
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
        data: null,
      } as IResponse);
    }

    // Verify refresh token
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      id: string;
      role: string;
    };

    // Create new access token
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: {
        accessToken: newAccessToken,
      },
    } as IResponse);
  } catch (error: unknown) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      data: null,
    } as IResponse);
  }
};

// =========================
// LOGOUT
// =========================

export const logout = async (req: Request, res: Response) => {
  try {
    // Remove refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      data: null,
    } as IResponse);
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      data: null,
    } as IResponse);
  }
};
