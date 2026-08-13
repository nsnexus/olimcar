// public/js/app.js
import { renderLandingPage } from './pages/landing.js';
import { renderLoginPage } from './pages/login.js';
import { renderDashboardPage, loadDashboardJogos } from './pages/dashboard.js';
import { renderAgendaPage } from './pages/agenda.js';
import { renderEquipesPage } from './pages/admin/equipes.js';
import { renderModalidadesPage } from './pages/admin/modalidades.js';
import { renderJogoEditorPage } from './pages/admin/jogo_editor.js';
import { renderSumulaEditorPage } from './pages/admin/sumula_editor.js';
import { renderLiderDashboardPage } from './pages/lider_dashboard.js';
import { renderEquipesPublicPage } from './pages/equipes.js';
import { loginUser, logoutUser, currentUser, authResolved } from './auth.js';
import { seedInitialData } from './services/db.js';

const appRoot = document.getElementById('app-root');
const mainNav = document.getElementById('main-nav');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

// Lógica de menu mobile
mobileMenuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('show');
});

// Rotas Privadas
const privateRoutes = ['/dashboard', '/lider'];

// Sistema de Roteamento Simples Baseado em Hash
const routes = {
    '/': renderLandingPage,
    '/agenda': renderAgendaPage,
    '/equipes': renderEquipesPublicPage,
    '/resultados': () => '<div class="container" style="padding-top: 2rem;"><h2>Resultados</h2></div>',
    '/ranking': () => '<div class="container" style="padding-top: 2rem;"><h2>Quadro de Medalhas</h2></div>',
    '/login': renderLoginPage,
    '/dashboard': renderDashboardPage,
    '/lider': renderLiderDashboardPage,
    '/admin/equipes': renderEquipesPage,
    '/admin/modalidades': renderModalidadesPage,
    '/admin/jogo': renderJogoEditorPage,
    '/admin/sumula': renderSumulaEditorPage,
    '/privacidade': () => `
        <div class="container" style="padding-top: 2rem; max-width: 800px; padding-bottom: 4rem;">
            <h2 style="margin-bottom: 1.5rem; color: var(--color-primary-800);">Política de Privacidade e Uso de Imagem</h2>
            <div class="card" style="padding: 2.5rem; line-height: 1.6; color: var(--color-text-main); font-size: 1.05rem;">
                <h3 style="color: var(--color-primary-600); margin-bottom: 0.5rem; font-size: 1.25rem;">1. Coleta de Dados</h3>
                <p style="margin-bottom: 1.5rem;">O sistema Olimcar coleta apenas dados funcionais para a gestão das competições esportivas organizadas, como nomes das equipes, pontuações, infrações e evidências fotográficas das súmulas.</p>
                
                <h3 style="color: var(--color-primary-600); margin-bottom: 0.5rem; font-size: 1.25rem;">2. Uso de Imagens (Evidências)</h3>
                <p style="margin-bottom: 1.5rem;">As imagens enviadas no recurso de Súmula Oficial têm como único propósito validar os placares registrados pelos mesários e árbitros em quadra. O uso dessas imagens em campanhas externas sem o consentimento prévio dos colaboradores envolvidos é terminantemente proibido.</p>

                <h3 style="color: var(--color-primary-600); margin-bottom: 0.5rem; font-size: 1.25rem;">3. Acesso Restrito</h3>
                <p style="margin-bottom: 1.5rem;">O painel administrativo é de acesso estrito aos gestores do evento. Apenas usuários autenticados via plataforma de segurança (Firebase Auth) têm permissão para criar, alterar e encerrar partidas.</p>
                
                <h3 style="color: var(--color-primary-600); margin-bottom: 0.5rem; font-size: 1.25rem;">4. Limpeza e Exclusão</h3>
                <p style="margin-bottom: 0;">Todos os dados esportivos armazenados no banco de dados poderão ser reinicializados pelos administradores após o término do circuito olímpico corporativo, garantindo a limpeza e privacidade das bases a cada nova edição.</p>
            </div>
        </div>
    `
};

function router() {
    let fullHash = window.location.hash.slice(1) || '/';
    if (fullHash === '') fullHash = '/';
    
    // Ignora query params como ?id=123 na hora de procurar no objeto routes
    let hash = fullHash.split('?')[0];
    
    mainNav.classList.remove('show');
    
    // Proteção de rota
    if (privateRoutes.includes(hash)) {
        if (!authResolved) {
            // Se o Firebase ainda não resolveu, mostra tela de loading e ABORTA a expulsão!
            appRoot.innerHTML = '<div style="text-align: center; padding: 10rem 2rem;"><i data-lucide="loader-2" class="spin" style="width: 48px; height: 48px; color: var(--color-primary-500); margin-bottom: 1rem;"></i><p style="color: var(--color-text-muted);">Verificando credenciais...</p></div>';
            if (window.lucide) window.lucide.createIcons();
            return;
        }
        if (!currentUser) {
            window.location.hash = '/login';
            return;
        }
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
                    const authResult = await loginUser(email, password);
                    if (authResult.role === 'lider') {
                        window.location.hash = '/lider';
                    } else {
                        window.location.hash = '/dashboard';
                    }
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
