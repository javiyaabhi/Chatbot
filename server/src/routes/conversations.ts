import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { conversations } from "../store.js";
import { getTutorResponse } from "../services/ai.js";

export const conversationRouter = Router();
conversationRouter.use(requireAuth);

const createSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().min(1).max(80).default("General"),
  language: z.enum(["en", "hi", "gu"]).default("gu"),
});

const messageSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  teachingMode: z.enum(["beginner", "intermediate", "advanced", "step-by-step"]).default("beginner"),
});

conversationRouter.get("/", (req: AuthRequest, res) => {
  const owned = [...conversations.values()]
    .filter((conversation) => conversation.userId === req.userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ conversations: owned });
});

conversationRouter.post("/", (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check the conversation details." });
  const now = new Date().toISOString();
  const conversation = {
    id: crypto.randomUUID(),
    userId: req.userId!,
    title: parsed.data.title ?? "New learning conversation",
    subject: parsed.data.subject,
    language: parsed.data.language,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  conversations.set(conversation.id, conversation);
  return res.status(201).json({ conversation });
});

conversationRouter.get("/:id", (req: AuthRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ error: "Conversation ID is required." });
  const conversation = conversations.get(id);
  if (!conversation || conversation.userId !== req.userId) return res.status(404).json({ error: "Conversation not found." });
  return res.json({ conversation });
});

conversationRouter.patch("/:id/language", (req: AuthRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ error: "Conversation ID is required." });
  const conversation = conversations.get(id);
  if (!conversation || conversation.userId !== req.userId) return res.status(404).json({ error: "Conversation not found." });
  const parsed = z.object({ language: z.enum(["en", "hi", "gu"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please select a supported language." });
  conversation.language = parsed.data.language;
  conversation.updatedAt = new Date().toISOString();
  return res.json({ conversation });
});

conversationRouter.patch("/:id", (req: AuthRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ error: "Conversation ID is required." });
  const conversation = conversations.get(id);
  if (!conversation || conversation.userId !== req.userId) return res.status(404).json({ error: "Conversation not found." });
  const parsed = z.object({
    title: z.string().trim().min(1).max(120).optional(),
    subject: z.string().trim().min(1).max(80).optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid updates." });
  if (parsed.data.title) conversation.title = parsed.data.title;
  if (parsed.data.subject) conversation.subject = parsed.data.subject;
  conversation.updatedAt = new Date().toISOString();
  return res.json({ conversation });
});

conversationRouter.delete("/:id", (req: AuthRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ error: "Conversation ID is required." });
  const conversation = conversations.get(id);
  if (!conversation || conversation.userId !== req.userId) return res.status(404).json({ error: "Conversation not found." });
  conversations.delete(id);
  return res.json({ success: true, id });
});

conversationRouter.post("/:id/messages", async (req: AuthRequest, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) return res.status(400).json({ error: "Conversation ID is required." });
  const conversation = conversations.get(id);
  if (!conversation || conversation.userId !== req.userId) return res.status(404).json({ error: "Conversation not found." });
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please enter a valid question." });

  const now = new Date().toISOString();
  conversation.messages.push({ id: crypto.randomUUID(), role: "user", content: parsed.data.question, createdAt: now });
  const answer = await getTutorResponse({
    question: parsed.data.question,
    language: conversation.language,
    teachingMode: parsed.data.teachingMode,
  });
  conversation.messages.push({ id: crypto.randomUUID(), role: "assistant", content: answer.content, createdAt: new Date().toISOString() });
  conversation.updatedAt = new Date().toISOString();
  conversation.title = conversation.messages[0]?.content.slice(0, 60) ?? conversation.title;
  return res.status(201).json({ message: conversation.messages.at(-1), provider: answer.provider });
});
