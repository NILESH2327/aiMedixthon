import express from 'express';
import { clerkMiddleware,requireAuth } from '@clerk/express';

import { cancelServiceAppointment, confirmServicePayment, createServiceAppointment, getSerivcesAppointmentsByPateint, getServiceAppointmentById, getServiceAppointments, getServiceAppointmentStats, updateServiceAppointment } from '../controllers/serviceAppointmentController.js';

const serApptRouter = express.Router();


serApptRouter.get("/" ,getServiceAppointments);
serApptRouter.get("/confirm" ,confirmServicePayment);
serApptRouter.get("/stats/summary" ,getServiceAppointmentStats);
serApptRouter.post("/" ,clerkMiddleware(),requireAuth(),createServiceAppointment);
serApptRouter.get("/me" ,clerkMiddleware(),requireAuth(),getSerivcesAppointmentsByPateint);
serApptRouter.get("/:id" ,getServiceAppointmentById);
serApptRouter.put("/:id" ,updateServiceAppointment);
serApptRouter.post("/:id/cancel",cancelServiceAppointment);

export default serApptRouter;
