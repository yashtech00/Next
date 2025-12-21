
import jwt from "jsonwebtoken";


export const authMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ error: "Unauthorized no token" });
    }
    try {
        const jwtSecret = process.env.JWT_SECRET || "secret";
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized invalid token" });
        }
        
        // Handle both token structures: { id: number } or { user: { id: number } }
        const userId = decoded.id || decoded.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: user ID not found in token" });
        }
        
        req.userId = userId;
        next();
    } catch (error: any) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({ error: "Unauthorized invalid token catch" });
    }
};