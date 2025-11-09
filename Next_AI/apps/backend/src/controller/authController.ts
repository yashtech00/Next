import {prisma} from "db/client";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    return res
      .status(201)
      .header("Authorization", `Bearer ${token}`)
      .json({ user, token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to register user" });
  }
};


export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

        return res
            .status(200)
            .header("Authorization", `Bearer ${token}`)
            .json({ user, token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to login user" });
    }
};

export const oauthCallback = (req: Request, res: Response) => {
  const user = req.user as any;

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  // send token back same like normal login
  // no cookie now
  return res.redirect(`${process.env.FRONTEND_URL}/?token=${token}`);
};



