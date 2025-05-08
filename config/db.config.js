import mongoose from 'mongoose'

export const connectToMongoDB = () => {
  try {
    mongoose.connect(process.env.MONGO_DB_URI).then(() => console.log("✅ Connected to MongoDB"))
  } catch (error) {
    console.log("❌ Couldn't connect to MongoDB", error)
  }
}