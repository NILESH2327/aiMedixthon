import mongoose from "mongoose";

export const connectDB = async () => {
   const uri = process.env.MONGODB_URI;
   if (!uri) {
      console.error("Error: MONGODB_URI environment variable is missing.");
      return;
   }
   await mongoose.connect(uri)
      .then(() => {
         console.log("Connected to MongoDB");
      })
      .catch((err) => {
         console.error("Error connecting to MongoDB:", err);
      });
}