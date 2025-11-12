// api/delete-account.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'; 

// Variáveis de Ambiente e Cache (melhor prática Vercel)
const uri = process.env.MONGO_URI;
let cached = global.mongo; 

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
    if (!uri) {
        throw new Error("ERRO CRÍTICO: Variável MONGO_URI não configurada no Vercel.");
    }
    
    if (cached.conn) {
        return cached.conn.db('TimePet');
    }

    if (!cached.promise) {
        cached.promise = MongoClient.connect(uri).then((client) => {
            return client; 
        });
    }

    cached.conn = await cached.promise;
    return cached.conn.db('TimePet'); 
}

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).send({ message: 'Método não permitido.' });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios para confirmar a exclusão.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users'); 

        // 1. BUSCA O USUÁRIO PELO EMAIL
        const user = await usersCollection.findOne({ email });

        if (!user) {
            // Retorna sucesso para evitar que atacantes descubram e-mails existentes
            return res.status(200).json({ message: 'Conta excluída ou não encontrada.' });
        }

        // 2. PASSO CRUCIAL: COMPARA A SENHA EM TEXTO PURO COM O HASH
        // O bcrypt.compare() lida com a criptografia internamente.
        const isPasswordValid = await bcrypt.compare(password, user.password); // <--- A MÁGICA ACONTECE AQUI

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta. Não foi possível confirmar a exclusão.' });
        }

        // 3. AUTENTICAÇÃO BEM-SUCEDIDA: EXCLUI A CONTA
        const result = await usersCollection.deleteOne({ email });

        if (result.deletedCount === 1) {
            return res.status(200).json({ 
                message: 'Sua conta foi excluída com sucesso.',
                success: true
            });
        } else {
            return res.status(500).json({ message: 'Falha ao deletar a conta.' });
        }

    } catch (error) {
        console.error('Erro na Serverless Function de exclusão:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}