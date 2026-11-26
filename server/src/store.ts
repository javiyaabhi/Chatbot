import bcrypt from "bcryptjs";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  preferredLanguage: "en" | "hi" | "gu";
  learningLevel: "beginner" | "intermediate" | "advanced";
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  subject: string;
  language: "en" | "hi" | "gu";
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export const users = new Map<string, User>();
export const conversations = new Map<string, Conversation>();

export async function createUser(input: Omit<User, "id" | "passwordHash"> & { password: string }) {
  const id = crypto.randomUUID();
  const user: User = {
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 12),
    preferredLanguage: input.preferredLanguage,
    learningLevel: input.learningLevel,
  };
  users.set(id, user);
  return user;
}
