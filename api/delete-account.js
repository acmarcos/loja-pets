// api/delete-account.js

// 🚨 CORREÇÃO: Trocado 'bcrypt' por 'bcryptjs' para compatibilidade com o ambiente Vercel.
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs'; 

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
    // O nome do seu banco é TimePet, confirmado pelas capturas
    return cached.conn.db('TimePet'); 
}

export default async function handler(req, res) {
    // Permite POST (do frontend que usa fetch) ou DELETE (se fosse um cliente REST)
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
            // Retorna 401 ou 200 (para segurança)
            // Mantido 401 para o cliente saber que a credencial falhou.
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // 2. PASSO CRUCIAL: COMPARA A SENHA EM TEXTO PURO COM O HASH
        // Usando bcryptjs.compare()
        const isPasswordValid = await bcrypt.compare(password, user.password); // <--- AGORA COM bcryptjs

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
            // Este caso é improvável se o findOne foi bem-sucedido
            return res.status(500).json({ message: 'Falha ao deletar a conta (Registro não encontrado).' });
        }

    } catch (error) {
        console.error('Erro na Serverless Function de exclusão:', error);
        // Retorna 500 se houver um erro de conexão com o Mongo ou erro desconhecido.
        return res.status(500).json({ message: 'Erro interno do servidor. Verifique os logs do Vercel.' });
    }
}