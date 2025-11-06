// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../modelos/modelouser');

// Rota POST /api/auth/register (Para registrar novos usuários no MongoDB)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 1. Validação básica
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // 2. Cria o novo usuário
        const newUser = await User.create({
            name,
            email,
            // ATENÇÃO: Em produção, a senha deve ser HASHED (ex: usando bcrypt) antes de salvar!
            password 
        });

        // 3. Responde ao frontend
        res.status(201).json({ 
            message: 'Usuário registrado com sucesso!', 
            userId: newUser._id 
        });
    } catch (error) {
        // Lida com erros (ex: email já existe)
        if (error.code === 11000) {
             return res.status(400).json({ message: 'Este email já está em uso.' });
        }
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

module.exports = router;