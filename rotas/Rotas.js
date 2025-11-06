const express = require('express');
const router = express.Router();

const Product = require('../modelos/modelos'); 

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ id: 1 });
        return res.status(200).json(products);
    } catch (err) {
        console.error("Erro ao buscar produtos do MongoDB:", err);
        return res.status(500).json({ message: "Erro interno do servidor ao buscar produtos." });
    }
});

module.exports = router;