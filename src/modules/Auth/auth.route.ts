import { Router } from "express";
import { login, logout, signup, refreshToken } from "./auth.controller";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", logout);

export default authRouter;
