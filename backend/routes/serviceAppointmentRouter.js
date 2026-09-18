import express from 'express';
import { getAuth } from '@clerk/express';
import jwt from 'jsonwebtoken';

import { cancelServiceAppointment, confirmServicePayment, createServiceAppointment, getSerivcesAppointmentsByPateint, getServiceAppointmentById, getServiceAppointments, getServiceAppointmentStats, updateServiceAppointment } from '../controllers/serviceAppointmentController.js';

const serApptRouter = express.Router();

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
  if (!userId && req.headers && req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace(/^Bearer\s+/i, "");
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.userId || decoded.user_id)) {
        userId = decoded.sub || decoded.userId || decoded.user_id;
      }
    } catch (e) {}
  }
  if (!userId) {
    userId = req.body?.clerkUserId || req.body?.userId || req.headers?.["x-clerk-user-id"] || null;
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to book a service appointment.",
    });
  }
  req.userId = userId;
  next();
};

serApptRouter.get("/", getServiceAppointments);
serApptRouter.get("/confirm", confirmServicePayment);
serApptRouter.get("/stats/summary", getServiceAppointmentStats);
serApptRouter.post("/", requireAuthApi, createServiceAppointment);
serApptRouter.get("/me", requireAuthApi, getSerivcesAppointmentsByPateint);
serApptRouter.get("/:id", getServiceAppointmentById);
serApptRouter.put("/:id", updateServiceAppointment);
serApptRouter.post("/:id/cancel", cancelServiceAppointment);

export default serApptRouter;
