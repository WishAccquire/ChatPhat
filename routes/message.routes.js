import { Router } from "express";
import { authUser } from '../Middleware/auth.middleware.js';
import { body } from 'express-validator';
import { getProjectMessages, saveMessage } from "../controllers/message.controller.js";

const router = Router();

// Get messages for a project
router.get('/project/:projectId', authUser, getProjectMessages);

// Save a message (optional - can be used for manual message saving)
router.post('/save', 
    authUser,
    body('content').isString().withMessage('Message content is required'),
    body('projectId').isString().withMessage('Project ID is required'),
    body('messageType').optional().isIn(['user', 'ai']).withMessage('Message type must be user or ai'),
    saveMessage
);

export default router;