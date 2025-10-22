import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI).then(() => 
      console.log("✅ Connected to MongoDB")
  )
  } catch (error) {
    console.log(error);
  }
}