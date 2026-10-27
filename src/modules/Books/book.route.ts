import { Router } from "express";
import { addBook, deleteBook, getBooks, updateBook } from "./book.controller";

const bookRouter = Router();

bookRouter.get("/get-books", getBooks);
bookRouter.post("/add-book", addBook);
bookRouter.put("/update-book/:id", updateBook);
bookRouter.delete("/delete-book/:id", deleteBook);

export default bookRouter;
