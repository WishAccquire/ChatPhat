import { Router } from "express";
import {authUser} from '../Middleware/auth.middleware.js'
import {body} from 'express-validator'
import {createProjectController} from "../controllers/project.controller.js"
const router=Router();

router.post('/create',authUser,createProjectController)



export default router;