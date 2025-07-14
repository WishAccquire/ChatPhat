import { validationResult } from 'express-validator';
import * as messageService from '../services/message.service.js';

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        const messages = await messageService.getMessagesByProject({
            projectId,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

export const saveMessage = async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { content, projectId, messageType = 'user' } = req.body;
        const senderId = req.user.id; // From auth middleware

        const message = await messageService.saveMessage({
            content,
            senderId,
            projectId,
            messageType
        });

        return res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};