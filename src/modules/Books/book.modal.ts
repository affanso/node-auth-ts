import mongoose, { Schema, model } from "mongoose";

interface IBook {
  name: string;
  author: string;
  publishYear: number;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
}

const bookSchema = new Schema<IBook>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
    },

    publishYear: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Book = model<IBook>("Book", bookSchema);

export { Book, IBook };
