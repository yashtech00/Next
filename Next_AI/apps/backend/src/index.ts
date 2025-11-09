import dotenv from "dotenv";
// Load env vars as early as possible so modules (Prisma, passport strategies, etc.) can read them
dotenv.config();

import express from "express";
import ProjectRouter from "./routes/projectRoutes";
import AuthRouter from "./routes/authRoutes";
import cors from "cors";
import passport from "passport";
import "./config/passport";
import session from "express-session";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));



app.use(express.json());

app.get("/", (req, res) => {
    
});


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


app.use("/api/v1/projects", ProjectRouter)

app.use("/api/v1/auth", AuthRouter)

app.listen(9090, () => {
    console.log("Server started on port 9090");
});
