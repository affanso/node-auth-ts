import { Router } from "express";
import bookRouter from "../modules/Books/book.route";
import authRouter from "../modules/Auth/auth.route";

const routes = Router();

routes.use("/book", bookRouter);
routes.use("/auth", authRouter);

export default routes;
