import dotenv from "dotenv";
dotenv.config();
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

dotenv.config();

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
