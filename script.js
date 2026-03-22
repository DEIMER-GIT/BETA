// --- DATOS ESTÁTICOS ---
const catalogGames = [
    { id: 1, title: "Super Plumber Bros", price: "$49.99", platform: "Retro NES", img: "https://images.unsplash.com/photo-1612404730960-5c71577fca11?auto=format&fit=crop&w=500&q=80" },
    { id: 2, title: "Space Arcade DX", price: "$29.99", platform: "Arcade", img: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=500&q=80" },
    { id: 3, title: "Cyber Racing", price: "$39.99", platform: "PSX", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80" },
    { id: 4, title: "Pocket Monsters", price: "$34.99", platform: "GameBoy", img: "https://images.unsplash.com/photo-1531525645387-7f14be1bfc75?auto=format&fit=crop&w=500&q=80" },
    { id: 5, title: "Fantasy World 64", price: "$59.99", platform: "N64", img: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?auto=format&fit=crop&w=500&q=80" },
    { id: 6, title: "Fighter Street II", price: "$45.99", platform: "Arcade", img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&w=500&q=80" },
    { id: 7, title: "Legend of Hero", price: "$54.99", platform: "SNES", img: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=500&q=80" },
    { id: 8, title: "Space Bounty", price: "$44.99", platform: "SNES", img: "https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?auto=format&fit=crop&w=500&q=80" }
];

// --- ESTADO DE LA APLICACIÓN ---
let currentUser = null;

// --- BASE DE DATOS LOCALSTORAGE ---
const DB = {
    getUsers: () => JSON.parse(localStorage.getItem('retro_users')) || {},
    saveUsers: (users) => localStorage.setItem('retro_users', JSON.stringify(users)),
    getCurrentUser: () => localStorage.getItem('retro_currentUser'),
    setCurrentUser: (username) => {
        if (username) localStorage.setItem('retro_currentUser', username);
        else localStorage.removeItem('retro_currentUser');
    },
    getReservations: () => JSON.parse(localStorage.getItem('retro_reservations')) || {},
    saveReservations: (res) => localStorage.setItem('retro_reservations', JSON.stringify(res))
};

// --- UI HELPERS ---
const views = {
    login: document.getElementById('view-login'),
    register: document.getElementById('view-register'),
    catalog: document.getElementById('view-catalog'),
    profile: document.getElementById('view-profile')
};
const navbar = document.getElementById('navbar');
const toastElem = document.getElementById('toast');

function showToast(msg) {
    toastElem.textContent = msg;
    toastElem.classList.add('show');
    setTimeout(() => toastElem.classList.remove('show'), 3000);
}

function navigateTo(viewName) {
    // Ocultar todas las vistas
    Object.values(views).forEach(v => v.classList.add('hidden'));

    // Mostrar la solicitada
    views[viewName].classList.remove('hidden');

    // Controlar visibilidad del navbar
    if (viewName === 'login' || viewName === 'register') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
        // Actualizar estado de botones
        document.getElementById('nav-catalog').classList.remove('active');
        document.getElementById('nav-profile').classList.remove('active');
        if (viewName === 'catalog') document.getElementById('nav-catalog').classList.add('active');
        if (viewName === 'profile') document.getElementById('nav-profile').classList.add('active');
    }

    // Ejecutar lógicas específicas de vista
    if (viewName === 'catalog') renderCatalog();
    if (viewName === 'profile') renderProfile();
}

// --- LÓGICA DE AUTENTICACIÓN ---
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const errorMsg = document.getElementById('reg-error');

    const users = DB.getUsers();
    if (users[user]) {
        errorMsg.style.display = 'block';
        return;
    }

    // Crear usuario
    users[user] = { password: pass, createdAt: new Date().toISOString() };
    DB.saveUsers(users);

    // Auto-login
    DB.setCurrentUser(user);
    currentUser = user;
    showToast('¡Jugador registrado! Start game.');
    document.getElementById('register-form').reset();
    errorMsg.style.display = 'none';
    navigateTo('catalog');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorMsg = document.getElementById('login-error');

    const users = DB.getUsers();
    if (users[user] && users[user].password === pass) {
        DB.setCurrentUser(user);
        currentUser = user;
        showToast(`¡Bienvenido de nuevo, ${user}!`);
        document.getElementById('login-form').reset();
        errorMsg.style.display = 'none';
        navigateTo('catalog');
    } else {
        errorMsg.style.display = 'block';
    }
});

document.getElementById('nav-logout').addEventListener('click', () => {
    DB.setCurrentUser(null);
    currentUser = null;
    showToast('Sesión cerrada. Game Over.');
    navigateTo('login');
});

// Enlaces de cambio de formulario
document.getElementById('link-register').addEventListener('click', () => navigateTo('register'));
document.getElementById('link-login').addEventListener('click', () => navigateTo('login'));
document.getElementById('nav-catalog').addEventListener('click', () => navigateTo('catalog'));
document.getElementById('nav-profile').addEventListener('click', () => navigateTo('profile'));

// --- LÓGICA DE CATÁLOGO ---
function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    // Obtener reservas actuales para ver si ya lo reservó
    const allRes = DB.getReservations();
    const userRes = allRes[currentUser] || [];
    const reservedGameIds = userRes.map(r => r.gameId);

    catalogGames.forEach(game => {
        const isReserved = reservedGameIds.includes(game.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
        <img src="${game.img}" alt="${game.title}" loading="lazy">
        <h3 class="card-title">${game.title}</h3>
        <div class="card-info">
            <span class="platform-badge">${game.platform}</span>
            <span>${game.price}</span>
        </div>
        <button class="btn" style="width: 100%; ${isReserved ? 'background-color: var(--secondary); cursor: default;' : ''}" 
                ${isReserved ? 'disabled' : ''}
                onclick="reserveGame(${game.id})">
            ${isReserved ? 'RESERVADO' : 'RESERVAR COPIA'}
        </button>
    `;
        grid.appendChild(card);
    });
}

window.reserveGame = function (gameId) {
    const game = catalogGames.find(g => g.id === gameId);
    if (!game) return;

    const allRes = DB.getReservations();
    if (!allRes[currentUser]) allRes[currentUser] = [];

    // Evitar duplicados (aunque el botón se deshabilita)
    if (allRes[currentUser].find(r => r.gameId === gameId)) return;

    allRes[currentUser].push({
        gameId: game.id,
        date: new Date().toLocaleDateString(),
        id: 'RES-' + Math.floor(Math.random() * 10000)
    });

    DB.saveReservations(allRes);
    showToast(`¡${game.title} reservado con éxito!`);
    renderCatalog(); // Recargar botones
};

// --- LÓGICA DE PERFIL ---
function renderProfile() {
    document.getElementById('profile-username').textContent = currentUser;
    const container = document.getElementById('reservations-container');
    container.innerHTML = '';

    const allRes = DB.getReservations();
    const userRes = allRes[currentUser] || [];

    if (userRes.length === 0) {
        container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <p style="font-size: 16px; margin-bottom: 10px;">No tienes reservas activas.</p>
            <button class="btn" style="max-width: 250px; margin: 0 auto;" onclick="navigateTo('catalog')">IR AL CATÁLOGO</button>
        </div>
    `;
        return;
    }

    userRes.forEach(res => {
        const game = catalogGames.find(g => g.id === res.gameId);
        if (!game) return; // Por si cambian los datos estáticos

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
        <img src="${game.img}" alt="${game.title}" style="height: 120px;" loading="lazy">
        <h3 class="card-title" style="font-size: 12px; height: auto;">${game.title}</h3>
        <div class="card-info" style="margin-bottom: 5px;">
            <span>Cod: ${res.id}</span>
        </div>
        <div class="card-info" style="margin-bottom: 15px;">
            <span>Fecha: ${res.date}</span>
            <span style="color: var(--primary)">${game.price}</span>
        </div>
        <button class="btn" style="width: 100%; background-color: var(--error); color: white;" 
                onclick="cancelReservation('${res.id}')">
            CANCELAR RESERVA
        </button>
    `;
        container.appendChild(card);
    });
}

window.cancelReservation = function (resId) {
    if (!confirm('¿Seguro que quieres cancelar esta reserva?')) return;

    const allRes = DB.getReservations();
    if (!allRes[currentUser]) return;

    allRes[currentUser] = allRes[currentUser].filter(r => r.id !== resId);
    DB.saveReservations(allRes);

    showToast('Reserva cancelada.');
    renderProfile(); // Recargar vista
};

// --- INICIALIZACIÓN ---
function init() {
    currentUser = DB.getCurrentUser();
    if (currentUser) {
        navigateTo('catalog');
    } else {
        navigateTo('login');
    }
}

// Arrancar
init();
