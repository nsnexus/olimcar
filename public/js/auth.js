// public/js/auth.js
import { auth } from './services/firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDocument } from './services/db.js';

// Estado global do usuário atual
export let currentUser = null;
export let currentUserData = null;

// Escutar mudanças de estado na autenticação
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        currentUserData = await getDocument('usuarios', user.email) || { role: 'admin' };
    } else {
        currentUserData = null;
    }

    const hash = window.location.hash;
    const btnLogin = document.getElementById('btn-login-nav');
    
    if (user) {
        if (btnLogin) btnLogin.innerHTML = '<i data-lucide="log-out" style="width: 16px; height: 16px; vertical-align: middle;"></i> Sair';
    } else {
        if (btnLogin) btnLogin.innerHTML = '<i data-lucide="user" style="width: 16px; height: 16px; vertical-align: middle;"></i> Login';
    }
    if (window.lucide) window.lucide.createIcons();

    if (hash.startsWith('#/admin') || hash.startsWith('#/lider')) {
        if (!user) {
            window.location.hash = '/login';
        } else if (hash.startsWith('#/admin') && currentUserData.role === 'lider') {
            window.location.hash = '/lider';
        }
    }
});

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const docSnap = await getDocument('usuarios', user.email);
        const role = docSnap ? docSnap.role : 'admin';
        return { user, role };
    } catch (error) {
        console.error("Erro no login:", error.code, error.message);
        throw error;
    }
}

// Função de Logout
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.hash = '/'; // Redireciona pra home ao sair
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
    }
}

// Atualizar botões/menus na interface se estiver logado
function updateUIAfterLogin() {
    const navAuth = document.querySelector('.nav-btn');
    if (navAuth) {
        navAuth.innerHTML = '<i data-lucide="layout-dashboard"></i> Painel';
        navAuth.setAttribute('href', '#/dashboard');
        navAuth.classList.remove('btn-outline');
        navAuth.classList.add('btn-primary');
    }
    if (window.lucide) window.lucide.createIcons();
}

// Atualizar botões/menus na interface se estiver deslogado
function updateUIAfterLogout() {
    const navAuth = document.querySelector('.nav-btn');
    if (navAuth) {
        navAuth.innerHTML = '<i data-lucide="log-in"></i> Entrar';
        navAuth.setAttribute('href', '#/login');
        navAuth.classList.remove('btn-primary');
        navAuth.classList.add('btn-outline');
    }
    if (window.lucide) window.lucide.createIcons();
}
