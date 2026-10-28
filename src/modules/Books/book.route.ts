import { Router } from "express";
import { addBook, deleteBook, getBooks, updateBook } from "./book.controller";
import { verifyToken, verifyRole } from "../../middlewares/auth.middleware";
import { Role } from "../../types/index";

const bookRouter = Router();

bookRouter.get("/get-books", getBooks);
bookRouter.post(
  "/add-book",
  verifyToken,
  verifyRole(Role.CREATOR, Role.ADMIN),
  addBook,
);
bookRouter.put(
  "/update-book/:id",
  verifyToken,
  verifyRole(Role.CREATOR, Role.ADMIN),
  updateBook,
);
bookRouter.delete(
  "/delete-book/:id",
  verifyToken,
  verifyRole(Role.CREATOR, Role.ADMIN),
  deleteBook,
);

export default bookRouter;
