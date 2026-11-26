import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session as string | undefined;
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "development-only-secret") as { sub: string };
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Your session is invalid or expired." });
  }
}
