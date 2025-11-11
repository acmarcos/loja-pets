// api/register.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

// Você deve ter a variável MONGO_URI configurada no Vercel
const uri = process.env.MONGO_URI;
let client;

// Função para conectar ao MongoDB (reutiliza a conexão)
async function connectToDatabase() {
    if (!uri) {
        throw new Error("MONGO_URI não está configurada.");
    }
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    // ⚠️ Database: 'TimePet'
    return client.db('TimePet'); 
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send({ message: 'Método não permitido.' });
    }

    // Coleta name, email e password do corpo da requisição
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const db = await connectToDatabase();
        // ⚠️ Coleção: 'users' (será criada se não existir)
        const usersCollection = db.collection('users');

        // 1. Verificar se o e-mail já existe
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        
        // 2. Criptografar a senha (Hashing)
        // O número 10 é o 'saltRounds' (custo do hashing), um valor padrão seguro.
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Criar o documento do novo usuário
        const newUser = {
            name: name,
            email: email,
            password: hashedPassword, // Salva a senha CRIPTOGRAFADA
            createdAt: new Date()
        };

        // 4. Inserir o novo usuário no MongoDB
        const result = await usersCollection.insertOne(newUser);

        // 5. Resposta de sucesso
        return res.status(201).json({
            message: 'Usuário registrado com sucesso! Você já pode fazer login.',
            userId: result.insertedId
        });

    } catch (error) {
        console.error('Erro no processamento do registro:', error);
        return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
    }
}