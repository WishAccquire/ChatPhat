import { Router } from "express";
import {authUser} from '../Middleware/auth.middleware.js'
import {body} from 'express-validator'
import {createProjectController,getAllProject,adduserToProject,getProject} from "../controllers/project.controller.js"
const router=Router();

router.post('/create',authUser,createProjectController)
router.get('/all',authUser,getAllProject)
router.put("/add-user",authUser,
    body('projectId')
        .isString()
        .withMessage('Project ID must be a string'),
    body('users')
        .isArray()
        .withMessage('Users must be an array').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('All users must be strings'),
        adduserToProject)

router.get("/get-project/:projectId",authUser,getProject)

export default router;