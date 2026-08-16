// public/js/auth.js
import { auth } from './services/firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDocument } from './services/db.js';

// Estado global do usuário atual
export let currentUser = null;
export let currentUserData = null;
export let authResolved = false;

// Escutar mudanças de estado na autenticação
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        let dbRole = await getDocument('usuarios', user.email);
        if (!dbRole) dbRole = await getDocument('usuarios', user.uid);
        
        currentUserData = dbRole || { role: 'admin' };
    } else {
        currentUserData = null;
    }

    const hash = window.location.hash;
    
    if (user) {
        updateUIAfterLogin(currentUserData.role);
    } else {
        updateUIAfterLogout();
    }
    if (window.lucide) window.lucide.createIcons();

    if (hash.startsWith('#/admin') || hash.startsWith('#/lider') || hash.startsWith('#/dashboard') || hash.startsWith('#/arbitro')) {
        if (!user) {
            window.location.hash = '/login';
        } else if ((hash.startsWith('#/admin') || hash.startsWith('#/dashboard') || hash.startsWith('#/arbitro')) && currentUserData.role === 'lider') {
            window.location.hash = '/lider';
        } else if ((hash.startsWith('#/admin') || hash.startsWith('#/dashboard') || hash.startsWith('#/lider')) && currentUserData.role === 'arbitro') {
            window.location.hash = '/arbitro';
        }
    }

    const wasNotResolved = !authResolved;
    authResolved = true;
    if (wasNotResolved) {
        window.dispatchEvent(new Event('hashchange')); // Acorda o app.js para ele renderizar a tela bloqueada pelo loading inicial
    }
});

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        let docSnap = await getDocument('usuarios', user.email);
        if (!docSnap) docSnap = await getDocument('usuarios', user.uid);
        
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
function updateUIAfterLogin(role = 'admin') {
    const navAuth = document.querySelector('.nav-btn');
    if (navAuth) {
        navAuth.innerHTML = '<i data-lucide="layout-dashboard"></i> Painel';
        navAuth.setAttribute('href', role === 'lider' ? '#/lider' : (role === 'arbitro' ? '#/arbitro' : '#/dashboard'));
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
