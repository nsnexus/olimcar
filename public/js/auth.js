// public/js/auth.js
import { auth } from './services/firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Estado global do usuário atual
export let currentUser = null;

// Escutar mudanças de estado na autenticação
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        currentUser = user;
        updateUIAfterLogin();
    } else {
        // Usuário deslogado
        currentUser = null;
        updateUIAfterLogout();
    }
});

// Função de Login
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
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
