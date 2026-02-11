import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import userRouter from "./routes/userRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import { stripeWebhook } from "./controllers/stripeWebhook.js";

const app = express();

// ✅ FIX: convert PORT to number
const port = Number(process.env.PORT) || 3000;

const trustedOrigins = process.env.TRUSTED_ORIGINS
  ? process.env.TRUSTED_ORIGINS.split(",")
  : ["http://localhost:5173"];

const corsOptions = {
  origin: trustedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));

// ✅ Express v5 wildcard fix
app.options(/.*/, cors(corsOptions));

app.post(
  "/app/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json({ limit: "50mb" }));

// ✅ Express v5 wildcard fix for auth
app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is Live!");
});

app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

// ✅ Railway fix: bind to 0.0.0.0
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
