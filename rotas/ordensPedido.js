// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

// Rota POST /api/orders (Para registrar novos pedidos no MongoDB)
router.post('/orders', async (req, res) => {
    try {
        const { items, total } = req.body;
        
        // 1. Validação
        if (!items || items.length === 0 || !total) {
            return res.status(400).json({ message: 'O pedido deve conter itens e um total.' });
        }

        // 2. Cria o novo pedido
        const newOrder = await Order.create({
            items,
            total,
            // status é 'Pendente' por padrão
        });

        // 3. Responde ao frontend
        res.status(201).json({ 
            message: 'Pedido criado com sucesso!', 
            orderId: newOrder._id 
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: 'Erro ao processar o pedido. Tente novamente.' });
    }
});

module.exports = router;