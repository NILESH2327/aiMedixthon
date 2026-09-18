import express from 'express';
import { getAuth } from '@clerk/express';

import { cancelAppointment, confirmPayment, createAppointment, getAppointments, getAppointmentsByDoctor, getAppointmentsByPatient, getRegisteredUserCount, getStats, updateAppointment } from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

const requireAuthApi = (req, res, next) => {
  let userId = null;
  if (typeof req.auth === "function") {
    try {
      userId = req.auth()?.userId;
    } catch (e) {}
  }
  if (!userId && req.auth?.userId) {
    userId = req.auth.userId;
  }
  if (!userId) {
    try {
      userId = getAuth(req)?.userId;
    } catch (e) {}
  }
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to book an appointment.",
    });
  }
  next();
};

appointmentRouter.get('/', getAppointments);
appointmentRouter.get('/confirm', confirmPayment);
appointmentRouter.get("/stats/summary", getStats);

appointmentRouter.post("/", requireAuthApi, createAppointment);

appointmentRouter.get('/me', requireAuthApi, getAppointmentsByPatient);
appointmentRouter.get("/doctor/:doctorId", getAppointmentsByDoctor);

appointmentRouter.post("/:id/cancel", cancelAppointment);
appointmentRouter.get("/patients/count", getRegisteredUserCount);
appointmentRouter.put("/:id", updateAppointment);

export default appointmentRouter;
