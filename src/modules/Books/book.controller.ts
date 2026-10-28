import type { Request, Response } from "express";
import { Book } from "./book.modal";
import { IResponse, Role } from "../../types/index";

export const addBook = async (req: Request, res: Response) => {
  const { name, author, publishYear, description } = req.body;

  try {
    if (!name || !author || !publishYear) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, author and publish year",
        data: null,
      } as IResponse);
    }

    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      } as IResponse);
    }

    const book = await Book.create({
      author,
      description,
      name,
      publishYear,
      createdBy: req.id,
    });

    return res.status(201).json({
      success: true,
      message: "Book added",
      data: book,
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
      message: "Internal Server Error",
      data: null,
    } as IResponse);
  }
};

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().populate(
      "createdBy",
      "name email username",
    );

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books found",
        data: null,
      } as IResponse);
    }

    return res.status(200).json({
      success: true,
      message: "Books found",
      data: books,
    } as IResponse);
  } catch (error: unknown) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    } as IResponse);
  }
};

export const updateBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, author, publishYear, description } = req.body;

  try {
    // Make sure user is authenticated
    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      } as IResponse);
    }

    // Find the book first
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No Book found",
        data: null,
      } as IResponse);
    }

    // Check ownership
    // Admin can update any book
    // Creator can only update their own book
    if (book.createdBy.toString() !== req.id && req.role !== Role.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this book",
        data: null,
      } as IResponse);
    }

    // Update book
    book.name = name ?? book.name;
    book.author = author ?? book.author;
    book.publishYear = publishYear ?? book.publishYear;
    book.description = description ?? book.description;

    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
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
      message: "Internal Server Error",
      data: null,
    } as IResponse);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Make sure user is authenticated
    if (!req.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      } as IResponse);
    }

    // Find the book
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "No Book Found",
        data: null,
      } as IResponse);
    }

    // Check ownership
    // Admin can delete any book
    // Creator can only delete their own book
    if (book.createdBy.toString() !== req.id && req.role !== Role.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this book",
        data: null,
      } as IResponse);
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: null,
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
      message: "Internal Server Error",
      data: null,
    } as IResponse);
  }
};
