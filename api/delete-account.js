import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs'; 

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

        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta. Não foi possível confirmar a exclusão.' });
        }

        const result = await usersCollection.deleteOne({ email });

        if (result.deletedCount === 1) {
            return res.status(200).json({ 
                message: 'Sua conta foi excluída com sucesso.',
                success: true
            });
        } else {
            return res.status(500).json({ message: 'Falha ao deletar a conta (Registro não encontrado).' });
        }

    } catch (error) {
        console.error('Erro na Serverless Function de exclusão:', error);
        return res.status(500).json({ message: 'Erro interno do servidor. Verifique os logs do Vercel.' });
    }
}
