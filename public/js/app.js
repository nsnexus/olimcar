// public/js/app.js
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage, loadDashboardJogos } from './pages/dashboard.js';
import { renderAgendaPage } from './pages/agenda.js';
import { renderEquipesPage } from './pages/admin/equipes.js';
import { renderJogoEditorPage } from './pages/admin/jogo_editor.js';
import { loginUser, logoutUser, currentUser } from './auth.js';
import { seedInitialData } from './services/db.js';

const appRoot = document.getElementById('app-root');
const mainNav = document.getElementById('main-nav');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Lógica de menu mobile
mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('show');
});

// Rotas Privadas
const privateRoutes = ['/dashboard'];

// Sistema de Roteamento Simples Baseado em Hash
const routes = {
    '/': renderLandingPage,
    '/agenda': renderAgendaPage,
    '/resultados': () => '<div class="container" style="padding-top: 2rem;"><h2>Resultados</h2></div>',
    '/ranking': () => '<div class="container" style="padding-top: 2rem;"><h2>Quadro de Medalhas</h2></div>',
    '/login': renderLoginPage,
    '/dashboard': renderDashboardPage,
    '/admin/equipes': renderEquipesPage,
    '/admin/modalidades': () => '<div class="container" style="padding-top: 2rem;"><h2>Modalidades</h2><p>Em construção</p></div>',
    '/admin/jogo': renderJogoEditorPage,
    '/privacidade': () => '<div class="container" style="padding-top: 2rem;"><h2>Política de Privacidade</h2></div>'
};

function router() {
    let fullHash = window.location.hash.slice(1) || '/';
    if (fullHash === '') fullHash = '/';
    
    // Ignora query params como ?id=123 na hora de procurar no objeto routes
    let hash = fullHash.split('?')[0];
    
    mainNav.classList.remove('show');
    
    // Proteção de rota
    if (privateRoutes.includes(hash) && !currentUser) {
        window.location.hash = '/login';
        return;
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${hash}`) link.classList.add('active');
    });

    const routeFunction = routes[hash] || (() => '<div class="container" style="padding-top: 2rem;"><h2>404 - Página não encontrada</h2></div>');
    appRoot.innerHTML = routeFunction();
    
    // Anexar eventos dinâmicos baseados na rota atual
    if (hash === '/login') {
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        const btnSubmit = document.getElementById('btn-submit');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                loginError.style.display = 'none';
                btnSubmit.textContent = 'Autenticando...';
                btnSubmit.disabled = true;
                
                try {
                    await loginUser(email, password);
                    window.location.hash = '/dashboard';
                } catch (error) {
                    loginError.style.display = 'block';
                    btnSubmit.textContent = 'Entrar no Sistema';
                    btnSubmit.disabled = false;
                }
            });
        }
    }
    
    if (hash === '/dashboard') {
        const btnLogout = document.getElementById('btn-logout');
        const btnSeed = document.getElementById('btn-seed');
        
        loadDashboardJogos();

        
        if (btnLogout) {
            btnLogout.addEventListener('click', async () => {
                await logoutUser();
            });
        }
        
        if (btnSeed) {
            btnSeed.addEventListener('click', async () => {
                const originalText = btnSeed.innerHTML;
                btnSeed.innerHTML = 'Carregando Dados...';
                btnSeed.disabled = true;
                
                await seedInitialData();
                
                btnSeed.innerHTML = '<i data-lucide="check"></i> Dados Semeados';
                setTimeout(() => { 
                    btnSeed.innerHTML = originalText;
                    btnSeed.disabled = false;
                    if (window.lucide) window.lucide.createIcons();
                }, 2000);
            });
        }
    }
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// A auth é assíncrona. O router pode rodar antes do currentUser ser resolvido.
// Como solução rápida, a lógica de auth.js atualiza a tela após resolver o usuário se o hash for privado.

// Escuta mudanças no hash e executa ao carregar
window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);
