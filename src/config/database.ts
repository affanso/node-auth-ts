import mongoose from "mongoose";

export const connectDb = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(mongoUri);

    console.log("Connection to DB established");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error connecting to DB:", error.message);
    }

    throw error;
  }
};
