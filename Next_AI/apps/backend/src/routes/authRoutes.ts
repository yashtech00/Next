import { Router } from "express";
import passport from "passport";
import { register, login, oauthCallback } from "../controller/authController";

const AuthRouter = Router();


AuthRouter.post("/register", register);
AuthRouter.post("/login", login);


AuthRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/api/v1/auth/failure" }),
  oauthCallback
);


AuthRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
AuthRouter.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/api/v1/auth/failure" }),
  oauthCallback
);

AuthRouter.get("/failure", (_, res) => res.send("OAuth login failed"));


export default AuthRouter;
