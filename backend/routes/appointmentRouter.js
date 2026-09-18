import express from 'express';
import { getAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';

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
  if (!userId && req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace(/^Bearer\s+/i, "");
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.userId || decoded.user_id)) {
        userId = decoded.sub || decoded.userId || decoded.user_id;
      }
    } catch (e) {}
  }
  if (!userId) {
    userId = req.body?.clerkUserId || req.body?.userId || req.headers["x-clerk-user-id"] || null;
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to book an appointment.",
    });
  }
  req.userId = userId;
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
