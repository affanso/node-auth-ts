import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";

const app: Express = express();

// MIDDLEWARES
app.use(
  cors({
    origin: process.env.HOST_URL || "*",
  }),
);
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "Hello world" });
});

// GLOBAL ERROR HANDLER
app.use(errorMiddleware);

export default app;
