import Doctor from "../models/Doctor.js";  
import jwt from "jsonwebtoken";



const JWT_SECRET = process.env.JWT_SECRET ;

export default async function doctorAuth(req, res, next) {

  const authHeader = req.headers.authorization;

  //check token 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success :false ,message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    if (payload.role && payload.role !== "doctor") {
      return res.status(403).json({ success :false ,message: "Unauthorized(not a doctor)" });
    }

    //fetch doctor from db and attach to req
    const doctor = await Doctor.findById(payload.id).select("-password");
    if (!doctor) {
      return res.status(401).json({ success :false ,message: "Unauthorized" });
    }

    req.doctor = doctor;
    next();

  }catch (error) {
    console.error("Doctor jwt auth error:", error);
    return res.status(401).json({ success :false ,message: "TOKEN INVALID!" });
  }


}