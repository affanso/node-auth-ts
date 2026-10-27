import { Router } from "express";
import bookRouter from "../modules/Books/book.route";

const routes = Router();

routes.use("/book", bookRouter);

export default routes;
