const STATIC_PRODUCTS = [
    { id: 901, name: "Zoetis Apoquel Oclacitinib 16mg - Comprimidos para Dermatite Atópica", price: 160.54, image: "https://images.tcdn.com.br/img/img_prod/808976/apoquel_3_6mg_comprimido_59_1_05675156215cce4d04fe4dacafa76344.png", category: "Medicamentos" },
    { id: 902, name: "Arranhador Adesivo Premium Para Gatos- Sofá Cama Box 50x50cm (CHUMBO)", price: 29.99, image: "https://m.media-amazon.com/images/I/71+2zi9nlcL._AC_UF1000,1000_QL80_FMwebp_.jpg", category: "Acessórios" },
    { id: 903, name: "Nutricon Nutriflakes® 500Gr Para Todos Os Tipos De Peixe Adulto", price: 78.99, image: "https://m.media-amazon.com/images/I/71lz5qpXXgL._AC_UF1000,1000_QL80_FMwebp_.jpg", category: "Alimentos" },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [...STATIC_PRODUCTS]; 

// NOVO: Estado do usuário e funções de persistência
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveUserState() {
    localStorage.setItem('user', JSON.stringify(currentUser));
}
// FIM NOVO

async function fetchProducts() {
    try {
        const response = await fetch('/api/products'); 
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const apiProducts = data;
        
        const combinedProducts = [...apiProducts];
        STATIC_PRODUCTS.forEach(staticP => {
            if (!combinedProducts.some(apiP => apiP.id === staticP.id)) {
                combinedProducts.push(staticP);
            }
        });
        
        products = combinedProducts;
        return apiProducts; 

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        showMessage('Não foi possível carregar produtos da API. Exibindo apenas itens estáticos.', true); 
        
        products = STATIC_PRODUCTS; 
        return []; 
    }
}

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

// CORRIGIDO: Usando primary-dark e soft-white
function showMessage(text, isError = false) {
    const box = document.getElementById('message-box');
    
    // Corrigido: Usando primary-dark e soft-white
    const baseClasses = 'fixed top-20 right-4 p-4 rounded-lg shadow-xl transition-opacity duration-300 opacity-0 z-50';
    const successClasses = 'bg-primary-dark text-soft-white'; // Cor principal para sucesso
    const errorClasses = 'bg-red-600 text-soft-white'; // Mantendo o vermelho para erro
    
    box.textContent = text;
    box.className = `${baseClasses} ${isError ? errorClasses : successClasses}`;
    
    box.classList.remove('hidden');
    void box.offsetWidth; 
    
    box.classList.remove('opacity-0');
    
    setTimeout(() => { box.classList.add('opacity-0'); }, 3000);
    setTimeout(() => { box.classList.add('hidden'); }, 3500);
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
    }
}

// CORRIGIDO: Usando soft-white, primary-medium e primary-dark
function updateLoginUI() {
    const loginButton = document.getElementById('login-link'); 
    const userDisplay = document.getElementById('user-display'); 

    if (currentUser) {
        // Usuário Logado
        if (loginButton) loginButton.classList.add('hidden');
        if (userDisplay) {
            userDisplay.classList.remove('hidden');
            // Corrigido: text-soft-white, hover:text-primary-medium e text-primary-dark
            userDisplay.innerHTML = `
                <div class="relative group">
                    <div class="flex items-center cursor-pointer text-soft-white hover:text-primary-medium transition duration-300">
                        <i data-lucide="user-check" class="w-5 h-5 mr-1"></i>
                        <span class="font-semibold">${currentUser.name || 'Usuário'}</span>
                        <i data-lucide="chevron-down" class="w-4 h-4 ml-1"></i>
                    </div>
                    <div class="absolute right-0 mt-2 w-48 bg-soft-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50">
                        <a href="#" onclick="handleLogout()" class="block px-4 py-2 text-sm text-primary-dark hover:bg-red-100">
                            <i data-lucide="log-out" class="w-4 h-4 mr-2 inline-block"></i> Logout
                        </a>
                    </div>
                </div>
            `;
            // Recria os ícones do Lucide
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }
    } else {
        // Usuário Deslogado
        if (loginButton) loginButton.classList.remove('hidden');
        if (userDisplay) userDisplay.classList.add('hidden');
    }
}

// CORRIGIDO: Usando soft-white, primary-dark e primary-medium E FLEXBOX para alinhamento
function renderProductCard(product) {
    return `
        <div class="product-card bg-soft-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-primary-dark flex flex-col h-full">
            <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300/5D737E/FCFFFD?text=${product.category}'" class="w-full h-48 object-cover">
            
            <div class="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <h3 class="text-lg font-semibold text-primary-dark">${product.name}</h3>
                    <p class="text-sm text-gray-500 mb-2">${product.category}</p>
                </div>
                
                <div class="mt-auto"> <p class="text-2xl font-bold text-primary-medium mb-3">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <button onclick="addToCart(${product.id})" class="w-full bg-primary-medium text-soft-white font-bold py-2 rounded-lg hover:bg-primary-dark transition duration-300 flex items-center justify-center">
                        <i data-lucide="plus-circle" class="w-5 h-5 mr-2"></i> Adicionar
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function renderRecommendedProducts() {
    const apiProductsList = await fetchProducts();
    const container = document.getElementById('recommended-products-grid');
    
    // Limpar o container antes de adicionar, caso ele tenha conteúdo
    container.innerHTML = ''; 
    
    if (products.length > 0) {
        const html = products.map(renderProductCard).join('');
        container.insertAdjacentHTML('beforeend', html);
    }
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId); 
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(); 
        updateCartCount();
        showMessage(`"${product.name}" adicionado ao carrinho!`);
    } else {
        showMessage(`Erro: Produto ID ${productId} não encontrado.`, true);
    }
}

function updateQuantity(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart.splice(itemIndex, 1);
            showMessage(`"${item.name}" removido do carrinho.`, true);
        } else {
            showMessage(`Quantidade de "${item.name}" atualizada.`);
        }
        
        saveCart(); 
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        
        saveCart(); 
        renderCart();
        updateCartCount();
        showMessage(`"${itemName}" removido do carrinho.`, true);
    }
}

// CORRIGIDO: Usando soft-white, primary-dark e primary-medium
function renderCartItem(item) {
    const subtotal = item.price * item.quantity;
    return `
        <div class="flex items-center justify-between bg-soft-white p-4 rounded-xl shadow-md border-l-4 border-primary-medium mb-4">
            <div class="flex-grow">
                <h4 class="text-lg font-semibold text-primary-dark">${item.name}</h4>
                <p class="text-sm text-gray-500">Preço unitário: R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                <p class="text-md font-bold mt-1">Subtotal: <span class="text-primary-medium">R$ ${subtotal.toFixed(2).replace('.', ',')}</span></p>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="updateQuantity(${item.id}, -1)" class="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200">
                    <i data-lucide="minus" class="w-4 h-4 text-primary-dark"></i>
                </button>
                <span class="text-lg font-bold w-6 text-center">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" class="p-2 bg-primary-medium rounded-full hover:bg-primary-dark transition duration-200">
                    <i data-lucide="plus" class="w-4 h-4 text-soft-white"></i>
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
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

async function checkout() {
    if (cart.length === 0) {
        showMessage('O carrinho está vazio. Adicione produtos antes de fechar o pedido.', true);
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
        items: cart.map(item => ({ id: item.id, quantity: item.quantity, price: item.price })),
        total: total,
    };

    try {
        const response = await fetch('/api/orders', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao finalizar o pedido. Tente novamente.');
        }

        cart.length = 0;
        saveCart(); 
        
        renderCart();
        updateCartCount();
        showMessage('Pedido feito com sucesso! Seu pedido foi enviado para processamento.');

    } catch (error) {
        console.error('Erro no checkout:', error);
        showMessage(`Erro ao finalizar pedido: ${error.message}`, true);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos.', true);
        return;
    }

    try {
        const response = await fetch('/api/login', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) { 
            showMessage(data.message || 'Login realizado com sucesso!', false);
            document.getElementById('login-form').reset();
            
            // ATUALIZADO: Salva o usuário no estado global e no localStorage
            currentUser = data.user; 
            saveUserState();
            updateLoginUI(); 
            
            navigateTo('home'); 
        } else {
            
            showMessage(data.message || 'Falha no login. Tente novamente.', true);
        }

    } catch (error) {
        console.error('Erro de rede ou servidor:', error);
        showMessage('Erro ao conectar com o servidor. Verifique sua conexão.', true);
    }
}

// NOVA FUNÇÃO: Lógica para deslogar
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('user');
    showMessage('Você foi desconectado.', true);
    updateLoginUI(); 
    navigateTo('home');
}
// FIM NOVA FUNÇÃO

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage('Por favor, preencha todos os campos.', true);
        return;
    }

    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem.', true);
        return;
    }

    const userData = { name, email, password };
    
    try {
        const response = await fetch('/api/register', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(`Cadastro de ${name} realizado com sucesso! Faça login para continuar.`, false);
            navigateTo('login');
            document.getElementById('register-form').reset();
        } else {
            throw new Error(data.message || 'Falha no registro. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro no registro:', error);
        showMessage(`Erro ao tentar registrar: ${error.message}`, true);
    }
}

async function handleDeleteAccount() {
    
    const email = document.getElementById('deleteEmail').value;
    const password = document.getElementById('deletePassword').value;

    if (!email || !password) {
        showMessage("Por favor, preencha o email e a senha para confirmar.", true);
        return;
    }

    
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL!')) {
        return;
    }

    try {
        
        const response = await fetch('/api/delete-account', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        
        if (response.ok && data.success) { 
            
            showMessage(data.message || 'Conta excluída com sucesso.', false);
            
            
            localStorage.clear();
            cart.length = 0;
            updateCartCount();
            
            // ATUALIZADO: Limpa o usuário após exclusão
            currentUser = null;
            updateLoginUI();

            
            navigateTo('login');
            
        } else if (response.status === 401) {
            
            showMessage(data.message || 'Senha incorreta. Não foi possível confirmar a exclusão.', true);
        
        } else {
            
            showMessage(data.message || 'Falha na exclusão da conta. Tente novamente.', true);
        }

    } catch (error) {
        console.error('Erro de rede ou servidor na exclusão:', error);
        
        showMessage('Erro grave ao conectar com o servidor. Verifique o console do Vercel.', true);
    }
}


window.onload = function() {
    // Corrigido para usar a lista global 'products' que inclui estáticos e API
    renderRecommendedProducts(); 
    updateCartCount();
    updateLoginUI(); // ESSENCIAL: Carrega o estado de login ao iniciar
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
};

// EXPOSIÇÃO: Garante que todas as funções sejam acessíveis pelo HTML
window.navigateTo = navigateTo;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleDeleteAccount = handleDeleteAccount; 
window.handleLogout = handleLogout; // NOVO: Exposto para o HTML
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;