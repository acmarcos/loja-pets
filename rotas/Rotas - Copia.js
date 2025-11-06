// routes/productRoutes.js
const express = require('express');
const router = express.Router();

// Dados de produto mock (idealmente viriam do MongoDB)
const MOCK_PRODUCTS = [
    { id: 1, name: "Café Especial Blend", price: 29.90, category: "Grãos", image: "https://placehold.co/400x300?text=Cafe+Blend" },
    { id: 2, name: "Chá Verde Orgânico", price: 18.50, category: "Chás", image: "https://placehold.co/400x300?text=Cha+Verde" },
    { id: 3, name: "Copo Térmico", price: 75.00, category: "Acessórios", image: "https://placehold.co/400x300?text=Copo+Termico" },
];

// Rota GET /api/products
router.get('/products', (req, res) => {
    // Retorna a lista de produtos (Simulado)
    res.status(200).json(MOCK_PRODUCTS);
});

module.exports = router;