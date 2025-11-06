// 1. Defina a URL base da sua API.
// Mantenha como localhost para testes locais. Depois do deploy no Vercel, você mudará para o seu domínio do Vercel.
const API_URL = 'http://localhost:3000/api'; 

const cart = [];
// Removida a lista de produtos estática! Agora ela será buscada do backend.
let products = []; // Variável para armazenar os produtos carregados do backend

// =========================================================================
// FUNÇÕES DE COMUNICAÇÃO COM O BACKEND (NOVAS OU MODIFICADAS)
// =========================================================================

async function fetchProducts() {
    try {
        // Faz a requisição GET para o endpoint de produtos do Node.js
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) {
            // Se o status HTTP não for 200-299, lança um erro
            throw new Error(`Erro ao buscar produtos. Status: ${response.status}`);
        }
        
        const data = await response.json();
        products = data; // Armazena os produtos na variável global
        return data;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        showMessage('Não foi possível carregar os produtos. Verifique o servidor.', true);
        // Retorna a lista local simulada como fallback se o servidor falhar (opcional)
        // Você pode re-adicionar a lista estática aqui se desejar um fallback offline, ou retornar []
        return []; 
    }
}

// *** IMPORTANTE: Estas funções PRECISAM ser adaptadas para o BACKEND futuramente. ***
// *** Por enquanto, elas permanecem SIMULADAS para manter a funcionalidade. ***

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // IDEALMENTE: Aqui você faria um fetch(API_URL + '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    if (email && password) {
        showMessage('Login simulado realizado com sucesso! (TODO: Implementar API)', false);
        navigateTo('home');
        document.getElementById('login-form').reset();
    } else {
        showMessage('Por favor, preencha todos os campos.', true);
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // IDEALMENTE: Aqui você faria um fetch(API_URL + '/auth/register', { method: 'POST', body: ... })
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Por favor, preencha todos os campos.', true);
        return;
    }

    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem.', true);
        return;
    }
    
    // Simulação de cadastro bem-sucedido
    showMessage(`Cadastro de ${name} realizado com sucesso! Faça login para continuar. (TODO: Implementar API)`);
    navigateTo('login');
    document.getElementById('register-form').reset();
}


// =========================================================================
// FUNÇÕES DE INTERFACE (MANTIDAS)
// =========================================================================

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'cart') {
        renderCart();
    }
    window.scrollTo(0, 0);
}

function showMessage(text, isError = false) {
    const box = document.getElementById('message-box');
    box.textContent = text;
    box.className = isError 
        ? 'fixed top-20 right-4 p-4 rounded-lg shadow-xl bg-red-600 text-white transition-opacity duration-300 opacity-0 z-50' 
        : 'fixed top-20 right-4 p-4 rounded-lg shadow-xl bg-dark-green text-white transition-opacity duration-300 opacity-0 z-50';
    
    box.classList.remove('hidden');
    setTimeout(() => { box.classList.remove('opacity-0'); }, 10);
    setTimeout(() => { box.classList.add('opacity-0'); }, 3000);
    setTimeout(() => { box.classList.add('hidden'); }, 3500);
}

function renderProductCard(product) {
    // Código inalterado para renderizar o card
    return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden border border-dark-green">
            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/22543d/68d391?text=Produto'" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-dark-green">${product.name}</h3>
                <p class="text-sm text-gray-500 mb-2">${product.category}</p>
                <p class="text-2xl font-bold text-light-green mb-3">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                <button onclick="addToCart(${product.id})" class="w-full bg-light-green text-dark-green font-bold py-2 rounded-lg hover:bg-green-400 transition duration-300 flex items-center justify-center">
                    <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i> Adicionar
                </button>
            </div>
        </div>
    `;
}

// MODIFICADA: Agora é assíncrona para esperar o fetchProducts
async function renderRecommendedProducts() {
    const productsList = await fetchProducts(); // Espera os produtos do backend
    const container = document.getElementById('recommended-products-grid');
    container.innerHTML = productsList.map(renderProductCard).join('');
    lucide.createIcons();
}

function addToCart(productId) {
    // Agora busca o produto na lista 'products' carregada do backend
    const product = products.find(p => p.id === productId); 
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showMessage(`"${product.name}" adicionado ao carrinho!`);
    }
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function renderCartItem(item) {
    const subtotal = item.price * item.quantity;
    // Código inalterado
    return `
        <div class="flex items-center bg-gray-50 p-4 rounded-xl shadow-md border-l-4 border-light-green">
            <div class="flex-grow">
                <h4 class="text-lg font-semibold text-dark-green">${item.name}</h4>
                <p class="text-sm text-gray-500">Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                <p class="text-md font-bold mt-1">Subtotal: <span class="text-light-green">R$ ${subtotal.toFixed(2).replace('.', ',')}</span></p>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="updateQuantity(${item.id}, -1)" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200">
                    <i data-lucide="minus" class="w-4 h-4 text-dark-green"></i>
                </button>
                <span class="text-lg font-bold w-6 text-center">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="p-2 bg-light-green rounded-full hover:bg-green-400 transition duration-200">
                    <i data-lucide="plus" class="w-4 h-4 text-dark-green"></i>
                </button>
                <button onclick="removeFromCart(${item.id})" class="p-2 bg-red-100 rounded-full hover:bg-red-200 transition duration-200 ml-4">
                    <i data-lucide="trash-2" class="w-4 h-4 text-red-500"></i>
                </button>
            </div>
        </div>
    `;
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 text-xl p-10">Seu carrinho está vazio. Adicione alguns produtos!</p>';
        totalElement.textContent = 'R$ 0,00';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(renderCartItem).join('');
    totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    lucide.createIcons();
}

function updateQuantity(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        renderCart();
        updateCartCount();
        showMessage(`"${itemName}" removido do carrinho.`, true);
    }
}

function checkout() {
    if (cart.length === 0) {
        showMessage('O carrinho está vazio. Adicione produtos antes de finalizar.', true);
        return;
    }
    // IDEALMENTE: Aqui você faria um fetch(API_URL + '/orders', { method: 'POST', body: JSON.stringify(cart) })
    
    cart.length = 0;
    renderCart();
    updateCartCount();
    showMessage('Compra finalizada com sucesso! (TODO: Enviar pedido para API)');
}

// =========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =========================================================================

window.onload = function() {
    renderRecommendedProducts(); // Chama a função que busca e renderiza do backend
    updateCartCount();
    lucide.createIcons();
};

// Exportando as funções
window.navigateTo = navigateTo;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;