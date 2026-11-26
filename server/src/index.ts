import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const mongoUri = process.env.MONGODB_URI;

async function start() {
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } else {
    console.warn("MONGODB_URI is not set; using in-memory development storage.");
  }

  createApp().listen(port, () => {
    console.log(`EduVaani API listening on http://localhost:${port}`);
  });
}

void start();
