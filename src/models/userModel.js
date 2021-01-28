import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Please enter a username']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
        default: 'user'
    },
    firstName: {
        type: String,
        required: [true, 'Please enter the first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please enter the last name']
    },
    avatar: {
        type: String
    }
},
{ timestamp: true });

export default mongoose.model('User', userSchema);