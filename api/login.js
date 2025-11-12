// api/login.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'; 

// Variáveis de Ambiente (configure MONGO_URI no dashboard do Vercel)
const uri = process.env.MONGO_URI;

// Variável global para armazenar a conexão em cache
let cached = global.mongo; 

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

// Função otimizada para reutilizar a conexão em Serverless
async function connectToDatabase() {
    if (!uri) {
        throw new new Error("ERRO CRÍTICO: Variável MONGO_URI não configurada no Vercel.");
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
    // 1. Garante que só aceita requisições POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).send({ message: 'Método não permitido.' });
    }

    // 2. Extrai as credenciais
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const db = await connectToDatabase();
        
        // 🚨 CORREÇÃO: A coleção de usuários deve ser 'users', e não 'TimePet'.
        const usersCollection = db.collection('users'); 

        // 3. Busca o usuário pelo email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            // É uma boa prática usar a mesma mensagem para e-mail ou senha errados, 
            // para evitar que um atacante descubra quais e-mails existem.
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 4. Compara a senha enviada (texto puro) com a senha hasheada no DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 5. Login bem-sucedido
        return res.status(200).json({ 
            message: 'Login realizado com sucesso!',
            success: true
            // Próximo passo: retornar um token JWT aqui!
        });

    } catch (error) {
        console.error('Erro na Serverless Function:', error);
        // Em caso de erro de conexão (MONGO_URI ou rede), este erro será disparado.
        return res.status(500).json({ message: 'Erro interno do servidor. Verifique os logs do Vercel.' });
    }
}