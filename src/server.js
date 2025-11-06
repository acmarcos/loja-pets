// server.js
require('dotenv').config(); // Carrega as variáveis de ambiente
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes'); // Adicionar esta rota depois

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Configuração do Middleware ---

// Configuração do CORS (Crucial para permitir requisições do frontend)
app.use(cors({
    origin: 'http://localhost:5500', // Substitua pela URL onde seu frontend está rodando (ex: Live Server)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para analisar corpos de requisição JSON
app.use(express.json());


// --- Conexão com o MongoDB ---

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB!'))
    .catch((err) => {
        console.error('❌ Erro de conexão com o MongoDB:', err.message);
        process.exit(1); // Sai do processo em caso de erro de conexão
    });


// --- Rotas da API ---

// Prefixo /api, conforme o seu frontend (API_URL = 'http://localhost:3000/api')
app.use('/api', productRoutes); // Rotas de GET /api/products
app.use('/api/auth', userRoutes); // Rotas de POST /api/auth/register (para Registro)
app.use('/api', orderRoutes); // Rotas de POST /api/orders (para Checkout)


// --- Inicialização do Servidor ---

app.listen(PORT, () => {
    console.log(`🌍 Servidor rodando em http://localhost:${PORT}`);
});