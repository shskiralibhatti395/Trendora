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
      console.log("✅ MongoDB Connect Ho Gaya!");
      return;
    } catch (error) {
      attempt += 1;
      console.log(`❌ Connection attempt ${attempt} failed:`, error.message);
      if (attempt >= MAX_RETRIES) {
        console.error("❌ MongoDB Connection Failed after", MAX_RETRIES, "attempts");
        throw error;
      }
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
