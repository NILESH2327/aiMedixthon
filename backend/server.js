import express from "express";
import bodyParser from "body-parser";
import cors from "cors";




import { clerkMiddleware } from '@clerk/express'
import {connectDB} from "./config/db.js";
import doctorRouter from "./routes/doctorRoute.js";
import dotenv from "dotenv";
dotenv.config();
import serviceRouter from "./routes/serviceRoute.js";
import appointmentRouter from "./routes/appointmentRouter.js";
import serApptRouter from "./routes/serviceAppointmentRouter.js";



const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins =[
  "http://localhost:5173",
  "http://localhost:5174",

];

// Middleware
app.use(bodyParser.json());
app.use(cors(
  {
    origin : function(origin ,callback){
      if(!origin) return callback(null ,true);
      if(allowedOrigins.includes(origin)){
          return callback(null ,true)
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials:true,
    methods:["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type", "Authorization"]
    
  }
));
app.use(clerkMiddleware())
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));


connectDB();
// Routes

app.use("/api/doctors",doctorRouter )
app.use("/api/services",serviceRouter)
app.use("/api/appointments",appointmentRouter)
app.use("/api/service-appointments" ,serApptRouter)


app.get("/", (req, res) => {
  res.send("Welcome to the AI-Powered Hospital Management System API");
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
})

