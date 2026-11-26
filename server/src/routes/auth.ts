import { Router } from "express";
import type { Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { z } from "zod";
import { createUser, users } from "../store.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(128),
  preferredLanguage: z.enum(["en", "hi", "gu"]),
  learningLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

const jwtSecret = () => process.env.JWT_SECRET ?? "development-only-secret";

function setSession(res: Response, userId: string, guest = false) {
  const token = jwt.sign({ sub: userId, guest }, jwtSecret(), { expiresIn: "7d" });
  res.cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function existingGuestId(req: Request) {
  const token = req.cookies?.session as string | undefined;
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, jwtSecret());
    if (typeof payload !== "string" && payload.guest === true && typeof payload.sub === "string") {
      return payload.sub;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

authRouter.post("/guest", (req, res) => {
  const userId = existingGuestId(req) ?? `guest-${crypto.randomUUID()}`;
  setSession(res, userId, true);
  return res.json({
    user: {
      id: userId,
      name: "Learner",
      email: "",
      preferredLanguage: "gu",
      learningLevel: "beginner",
    },
  });
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check the registration details.", fields: parsed.error.flatten() });
  if ([...users.values()].some((user) => user.email === parsed.data.email.toLowerCase())) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }
  const user = await createUser(parsed.data);
  setSession(res, user.id);
  return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage, learningLevel: user.learningLevel } });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please enter a valid email and password." });
  const user = [...users.values()].find((candidate) => candidate.email === parsed.data.email.toLowerCase());
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  setSession(res, user.id);
  return res.json({ user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage, learningLevel: user.learningLevel } });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("session");
  res.status(204).end();
});

authRouter.get("/me", requireAuth, (req: AuthRequest, res) => {
  const user = req.userId ? users.get(req.userId) : undefined;
  if (!user) return res.status(401).json({ error: "Authentication required." });
  return res.json({ user: { id: user.id, name: user.name, email: user.email, preferredLanguage: user.preferredLanguage, learningLevel: user.learningLevel } });
});
