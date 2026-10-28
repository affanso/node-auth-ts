import mongoose, { model, Schema } from "mongoose";

interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  booksAdded?: mongoose.Types.ObjectId[];
  role: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["creator", "visitor", "admin"],
  },
  booksAdded: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

const User = model<IUser>("User", userSchema);

export { User, IUser };
