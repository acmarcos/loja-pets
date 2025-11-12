// Adicione esta função ao seu script.js

async function handleDeleteAccount() {
    // 1. Coleta os dados dos campos do formulário
    const email = document.getElementById('deleteEmail').value;
    const password = document.getElementById('deletePassword').value;
    
    // Pega o elemento para exibir mensagens de erro/sucesso
    const messageElement = document.getElementById('deleteMessage');
    messageElement.textContent = ''; // Limpa mensagens anteriores

    if (!email || !password) {
        messageElement.textContent = 'Por favor, insira seu e-mail e senha para confirmar.';
        return;
    }

    // Confirmação final de segurança
    const confirmation = confirm("AVISO FINAL: Esta ação é permanente e irá deletar sua conta e todos os dados associados. Deseja realmente continuar?");
    if (!confirmation) {
        return;
    }

    try {
        // 2. Envia a requisição para a Serverless Function
        const response = await fetch('/api/delete-account', {
            method: 'POST', // Usamos POST para enviar o corpo JSON
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // 3. Processa a resposta do servidor (API)
        const data = await response.json();

        if (response.ok) {
            // Sucesso (Status 200) - Conta excluída
            alert('Conta excluída com sucesso! Você será redirecionado para a página inicial.');
            window.location.href = '/'; // Redireciona o usuário
        } else {
            // Falha (Status 400, 401, 500, etc.)
            messageElement.textContent = 'Erro: ' + (data.message || 'Falha desconhecida ao excluir conta.');
            // Se o erro for 401 (senha incorreta), o backend retorna a mensagem específica.
        }

    } catch (error) {
        console.error('Erro de conexão ou requisição:', error);
        messageElement.textContent = 'Erro de conexão com o servidor. Verifique sua rede.';
    }
}