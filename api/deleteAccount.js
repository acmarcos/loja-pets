// api/delete-account.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'; 

// Variáveis de Ambiente e Cache (devem ser as mesmas usadas em register.js e login.js)
const uri = process.env.MONGO_URI;
let cached = global.mongo; 

if (!cached) {
    cached = global.mongo = { conn: null, promise: null };
}

// Função para reutilizar a conexão
async function connectToDatabase() {
    if (!uri) {
        throw new new Error("ERRO CRÍTICO: Variável MONGO_URI não configurada no Vercel.");
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
    // 1. Garante que aceita métodos DELETE (ideal) ou POST (se o frontend simplificar)
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).send({ message: 'Método não permitido.' });
    }

    // 2. Extrai as credenciais necessárias para autenticação
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios para confirmar a exclusão.' });
    }

    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users'); 

        // 3. Busca o usuário pelo email
        const user = await usersCollection.findOne({ email });

        if (!user) {
            // Se o usuário não existe, informa que a conta foi excluída ou não existe (segurança)
            return res.status(200).json({ message: 'Conta excluída ou não encontrada.' });
        }

        // 4. Compara a senha para autenticar
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta. Não foi possível confirmar a exclusão.' });
        }

        // 5. Exclui o usuário no MongoDB
        const result = await usersCollection.deleteOne({ email });

        if (result.deletedCount === 1) {
            // 6. Sucesso na exclusão
            return res.status(200).json({ 
                message: 'Sua conta foi excluída com sucesso.',
                success: true
            });
        } else {
            // Isso só acontece se o usuário sumir entre o findOne e o deleteOne
            return res.status(500).json({ message: 'Falha ao deletar a conta.' });
        }

    } catch (error) {
        console.error('Erro na Serverless Function de exclusão:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}