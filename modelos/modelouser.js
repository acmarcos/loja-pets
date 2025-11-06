// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'O nome é obrigatório'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'O email é obrigatório'],
        unique: true, // Garante que não haverá emails duplicados
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória'],
        minlength: 6,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', userSchema);