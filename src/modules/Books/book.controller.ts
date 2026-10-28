import type { Request, Response } from "express";
import { Book } from "./book.modal";
import { IResponse } from "../../types/index";

export const addBook = async (req: Request, res: Response) => {
  const { name, author, publishYear, description } = req.body;

  try {
    const book = await Book.create({
      author,
      description,
      name,
      publishYear,
    });

    return res
      .status(201)
      .json({ success: true, message: "Book added", data: book } as IResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, message: error.message });
    } else {
      return res.status(500).json({ success: false, message: error });
    }
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find();
    if (!books) {
      return res
        .status(404)
        .json({ success: false, message: "No Books Found" } as IResponse);
    }

    return res.status(200).json({
      success: true,
      message: "Books found",
      data: books,
    } as IResponse);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" } as IResponse);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { name, author, publishYear, description } = req.body;

  try {
    const book = await Book.findByIdAndUpdate(
      id,
      { name, author, publishYear, description },
      { new: true },
    );
    if (!book)
      return res.status(404).json({ success: false, message: "No Book found" });

    return res.status(200).json({
      success: true,
      message: "Book Updated",
      data: book,
    } as IResponse);
  } catch (error: any) {
    return res
      .status(500)
      .json({ success: false, message: error.message } as IResponse);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({ success: false, message: "No Book Found" });
    }
    return res.status(200).json({ success: false, message: "Book Deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" } as IResponse);
  }
};
