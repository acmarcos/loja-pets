// models/orderModel.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Descomentar ao implementar autenticação
    items: [orderItemSchema],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pendente',
        enum: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'],
    },
    orderDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Order', orderSchema);