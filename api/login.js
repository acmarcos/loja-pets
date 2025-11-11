// api/login.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'; // Essencial para comparar a senha hasheada

// Variáveis de Ambiente (configure MONGO_URI no dashboard do Vercel)
const uri = process.env.MONGO_URI;
// Variável para reutilizar a conexão (melhor prática em Serverless)
let client;

// Função para conectar ao MongoDB
async function connectToDatabase() {
    if (!uri) {
        throw new Error("MONGO_URI não está configurada.");
    }
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    // Retorna a instância do seu banco de dados
    // ⚠️ SUBSTITUA 'NomeDoSeuDatabase' pelo nome do seu DB no Atlas!
    return client.db('TimePet'); 
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
        // ⚠️ SUBSTITUA 'NomeDaSuaColecao' pelo nome da sua coleção de usuários (ex: 'users')
        const usersCollection = db.collection('TimePet'); 

        // 3. Busca o usuário pelo email
        const user = await usersCollection.findOne({ email });

        if (!user) {
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
            // **IMPORTANTE**: Para segurança real, você DEVERIA retornar um JWT aqui.
        });

    } catch (error) {
        console.error('Erro na Serverless Function:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
}