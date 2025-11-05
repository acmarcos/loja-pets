const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use(express.static('public'));

// Substitua pelo link da sua conexão MongoDB Atlas
const mongoURI = 'mongodb+srv://timeepet:timepet6868@cluster0.a18grit.mongodb.net/?appName=Cluster0';

// Conectando no MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Conectado ao MongoDB Atlas!');
    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar:', error);
  });

// Define um schema para produtos
const produtoSchema = new mongoose.Schema({
  nome: String,
  preco: Number,
  descricao: String,
});

// Cria um modelo baseado no schema
const Produto = mongoose.model('Produto', produtoSchema);

// Rota para retornar todos os produtos no banco
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).send('Erro ao buscar produtos');
  }
});