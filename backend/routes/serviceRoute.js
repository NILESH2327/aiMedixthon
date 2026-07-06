import express from 'express';
import multer from 'multer';
 import { createService, deleteService, getServiceById, getServices, updateSevice } from '../controllers/servicesController.js';

 const upload = multer({dest: "/tmp"});
 const serviceRouter = express.Router();

 serviceRouter.get("/",getServices);
serviceRouter.get("/:id",getServiceById);

serviceRouter.post('/', upload.single("image"),createService);
serviceRouter.put("/:id",upload.single("image"),updateSevice);
serviceRouter.delete("/:id",deleteService);

export default  serviceRouter;
