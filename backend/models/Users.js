const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['user','admin'],
        default: 'user'
    },
    status:{
        type: String,
        enum: ['active','deactivate'],
        default: 'active'
    },
    totalBalance: {
        type: Number,
        default: 0
    },
    availableFunds: {
        type: Number,
        default: 0
    },
    investedAmount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Users',usersSchema);