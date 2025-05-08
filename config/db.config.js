import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectToMongoDB = () => {
  try {
    mongoose.connect(process.env.MONGO_DB_URI).then(() => { 
      console.log("MongoDB connected successfully");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}