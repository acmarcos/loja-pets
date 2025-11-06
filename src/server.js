// backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Módulo essencial para lidar com caminhos de arquivo
const productRoutes = require('../rotas/Rotas.js');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// =========================================================
// MIDDLEWARES E CONFIGURAÇÃO
// =========================================================

// 1. Configurar CORS (para permitir acesso do frontend durante o desenvolvimento)
app.use(cors()); 
// 2. Permite que o Express entenda o corpo das requisições como JSON
app.use(express.json());

// 3. CONFIGURAR SERVIÇO DE ARQUIVOS ESTÁTICOS
// O Node.js serve arquivos (HTML, CSS, JS, imagens) localizados no diretório 'public'
// path.join(__dirname, '..', 'public') resolve para: seu-projeto/public
app.use(express.static(path.join(__dirname, '..', 'public')));

// =========================================================
// CONEXÃO COM O BANCO DE DADOS
// =========================================================

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado ao MongoDB Atlas/Local!'))
    .catch(err => {
        console.error('❌ Erro de conexão com o MongoDB. Verifique MONGO_URI, Usuário e Acesso à Rede.', err);
        // Opcional: Terminar o processo se a conexão falhar
        // process.exit(1); 
    });

// =========================================================
// ROTAS DA API
// =========================================================

// Rotas para produtos (ex: GET /api/products)
app.use('/api/products', productRoutes);

// * Você adicionará as rotas de usuário (login/cadastro) aqui: app.use('/api/auth', authRoutes);

// =========================================================
// ROTA PRINCIPAL (FRONTEND)
// =========================================================

// Rota padrão (GET /). É o que carrega sua aplicação HTML.
app.get('/', (req, res) => {
    // Envia o index.html que está dentro da pasta 'public'
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// =========================================================
// INICIALIZAÇÃO DO SERVIDOR
// =========================================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor Full Stack rodando em http://localhost:${PORT}`);
    console.log(`Acesse seu frontend em: http://localhost:${PORT}/`);
});