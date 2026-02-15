import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    verificationToken: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document automatically deleted after 10 minutes (600 seconds)
    }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

export default PendingUser;
