// api/register.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

// URL de conexão de ambiente (deve ser configurada no Vercel como MONGO_URI)
const uri = process.env.MONGO_URI;

// Variável global para armazenar a conexão em cache
let cached = global.mongo; 

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

// Função para conectar ao MongoDB (reutiliza a conexão)
async function connectToDatabase() {
    if (!uri) {
        throw new Error("ERRO CRÍTICO: Variável MONGO_URI não configurada no Vercel.");
    }
    
    // Se já houver uma conexão ativa, retorne-a
    if (cached.conn) {
        return cached.conn.db('TimePet');
    }

    // Se não houver, crie a Promessa de conexão se ela ainda não existir
    if (!cached.promise) {
        cached.promise = MongoClient.connect(uri).then((client) => {
            return client; // Retorna o cliente conectado
        });
    }

    // Aguarde a conexão e armazene o cliente no cache
    cached.conn = await cached.promise;
    return cached.conn.db('TimePet'); // Retorna o database 'TimePet'
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send({ message: 'Método não permitido.' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Tenta conectar e obter o banco de dados
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // 1. Verificar se o e-mail já existe
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        
        // 2. Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Criar e inserir o novo usuário
        const newUser = {
            name: name,
            email: email,
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        // 4. Resposta de sucesso
        return res.status(201).json({
            message: 'Usuário registrado com sucesso! Você já pode fazer login.',
            userId: result.insertedId
        });

    } catch (error) {
        // Este é o log que você deve procurar no Vercel
        console.error('Erro no processamento do registro ou conexão:', error); 
        
        // Retorna um 500 para o frontend
        return res.status(500).json({ message: 'Erro interno ao processar o registro. Verifique os logs do servidor.' });
    }
}