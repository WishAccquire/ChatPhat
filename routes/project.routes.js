import { Router } from "express";
import {authUser} from '../Middleware/auth.middleware.js'
import {body} from 'express-validator'
import {createProjectController,getAllProject} from "../controllers/project.controller.js"
const router=Router();

router.post('/create',authUser,createProjectController)
router.get('/all',authUser,getAllProject)
router.put("/add-user",authUser,
    body('projectId')
        .isString()
        .withMessage('Project ID must be a string')
        .notEmpty()
        .withMessage('Project ID is required'),
    body('users')
        .isArray()
        .withMessage('Users must be an array').bail()
        .custom((value) => !value.every(item => typeof item === 'string').withMessage('All users must be strings'),),
    addUserToProject)

export default router;