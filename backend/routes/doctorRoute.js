import express from 'express';
import multer from 'multer';
import {createDoctor, getDoctorById, getDoctors, loginDoctor, toggleAvailability,deleteDoctor,updateDoctor} from '../controllers/doctorController.js';
import doctorAuth  from '../middlewares/doctorAuth.js';

const upload = multer({dest:"/tmp"});

const doctorRouter = express.Router();

doctorRouter.get("/", getDoctors);
doctorRouter.post('/login',loginDoctor);

doctorRouter.get('/:id',getDoctorById);

doctorRouter.post('/',upload.single("image"), createDoctor);

//after login

doctorRouter.put("/:id", doctorAuth,upload.single("image"),updateDoctor);
doctorRouter.post("/:id/toggle-availability",doctorAuth ,toggleAvailability);
doctorRouter.delete("/:id",deleteDoctor);

export default doctorRouter;

