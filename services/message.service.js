import Message from '../models/message.model.js';
import mongoose from 'mongoose';

export const saveMessage = async ({ content, senderId, projectId, messageType = 'user' }) => {
    if (!content) {
        throw new Error('Message content is required');
    }
    
    if (!projectId) {
        throw new Error('Project ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    // For user messages, validate senderId
    if (messageType === 'user') {
        if (!senderId) {
            throw new Error('Sender ID is required for user messages');
        }
        if (!mongoose.Types.ObjectId.isValid(senderId)) {
            throw new Error('Invalid sender ID format');
        }
    }

    const messageData = {
        content,
        project: projectId,
        messageType
    };

    // Only set sender for user messages
    if (messageType === 'user') {
        messageData.sender = senderId;
    }

    const message = await Message.create(messageData);

    // Populate sender info for user messages
    if (messageType === 'user') {
        await message.populate('sender', 'email');
    }

    return message;
};

export const getMessagesByProject = async ({ projectId, limit = 50, skip = 0 }) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    const messages = await Message.find({ project: projectId })
        .populate('sender', 'email')
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit);

    return messages;
};

export const deleteMessagesByProject = async ({ projectId }) => {
    if (!projectId) {
        throw new Error('Project ID is required');
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error('Invalid project ID format');
    }

    const result = await Message.deleteMany({ project: projectId });
    return result;
};