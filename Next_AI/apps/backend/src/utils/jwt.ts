import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export const generateMagicToken = (email: string) => {
  return jwt.sign({ email }, SECRET, { expiresIn: "10m" });
};

export const verifyMagicToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET) as { email: string };
  } catch (err) {
    return null;
  }
};
