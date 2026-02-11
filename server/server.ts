import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import { stripeWebhook } from "./controllers/stripeWebhook.js";

const app = express();
const port = process.env.PORT || 3000;

const trustedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: trustedOrigins,
    credentials: true,
  })
);

// IMPORTANT: handle preflight
app.options("*", cors());

app.post(
  "/app/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// JSON parser should be BEFORE routes
app.use(express.json({ limit: "50mb" }));

app.all("/api/auth/*", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
