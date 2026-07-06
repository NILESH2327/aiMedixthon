import mongoose from "mongoose";



// ShqlacxHNRG0MJQH
export const connectDB = async () => {
   await mongoose.connect("mongodb+srv://nileshkumar95559926_db_user:ShqlacxHNRG0MJQH@cluster0.ealu8dv.mongodb.net/medixthon")
      .then(() => {
         console.log("Connected to MongoDB");
      })
      .catch((err) => {
         console.error("Error connecting to MongoDB:", err);
      });
}