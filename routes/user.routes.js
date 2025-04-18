import { Router } from "express";
import {createUserController,LoginController, logoutController, profileController,getAllUsersController} from '../controllers/user.controller.js'
import {authUser} from '../Middleware/auth.middleware.js'
import {body} from 'express-validator'
const router=Router();

router.post("/register",createUserController)
router.post('/login',LoginController)
router.get('/profile',authUser,profileController)
router.get('/logout',authUser,logoutController)
router.get('/all',authUser,getAllUsersController)

export default router;