import mongoose from 'mongoose'

export const connectToMongoDB = () => {
  try {
    mongoose.connect(process.env.MONGO_DB_URI)
  } catch (error) {
    console.log("❌ Couldn't connect to MongoDB", error)
  }finally{
    console.log("✅ Connected to MongoDB")
  }
}