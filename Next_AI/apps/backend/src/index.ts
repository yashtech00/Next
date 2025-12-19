import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env from multiple possible locations
const envPaths = [
  resolve(__dirname, "../.env"),           // apps/backend/.env
  resolve(__dirname, "../../.env"),        // Root .env
  resolve(process.cwd(), ".env"),          // Current working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment variables from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn("⚠️  No .env file found. Using default values and system environment variables.");
  // Still call dotenv.config() without path to load from process.env
  dotenv.config();
}

import express from "express";
import ProjectRouter from "./routes/projectRoutes";
import AuthRouter from "./routes/authRoutes";
import cors from "cors";
import passport from "passport";
import "./config/passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import promptRouter from "./routes/promptRoutes";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const PORT = process.env.PORT || 9090;

app.use(express.json());

app.get("/", (req, res) => {});

app.use(cookieParser());

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1/projects", ProjectRouter);

app.use("/api/v1/auth", AuthRouter);

app.use("/api/v1/prompts", promptRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
