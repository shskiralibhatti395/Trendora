import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (error) {
      attempt += 1;
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
