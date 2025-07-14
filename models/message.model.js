import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: function() {
            return this.messageType === 'user';
        }
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        required: true
    },
    messageType: {
        type: String,
        enum: ['user', 'ai'],
        default: 'user'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ project: 1, timestamp: 1 });

export default mongoose.model('Message', messageSchema);