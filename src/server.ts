import app from "./app";
import { connectDb } from "./config/database";
import { config } from "dotenv";

config();
const PORT = process.env.PORT || 8000;

const startServer = async (): Promise<void> => {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to start server:", error.message);
    } else {
      console.error("Failed to start server:", error);
    }

    process.exit(1);
  }
};

startServer();
