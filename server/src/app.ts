import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { router } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { HttpError } from "./lib/httpError";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", router);

app.use(() => {
  throw new HttpError(404, "Route not found");
});

app.use(errorHandler);