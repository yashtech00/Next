import type { NextFunction } from "express";
import jwt from "jsonwebtoken";


export const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log(token,"yash token");
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { id: string };
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = (decoded).id;
        req.userId = userId
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
    }
};