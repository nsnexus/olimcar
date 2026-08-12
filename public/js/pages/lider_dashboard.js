// public/js/pages/lider_dashboard.js
import { currentUserData } from '../auth.js';

export function renderLiderDashboardPage() {
    setTimeout(loadLiderData, 50);

    return `
        <div class="container" style="padding-top: 2rem; max-width: 900px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div id="equipe-icone" style="width: 48px; height: 48px; border-radius: 50%; background: #ccc; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white;">
                        <i data-lucide="shield"></i>
                    </div>
                    <h2 id="equipe-titulo">Carregando Equipe...</h2>
                </div>
                <button class="btn btn-outline" id="btn-logout-lider">
                    <i data-lucide="log-out"></i> Sair
                </button>
            </div>
            
            <div class="card" style="margin-bottom: 2rem; padding: 1.5rem; text-align: center; border-left: 4px solid var(--color-primary-500);">
                <p>Bem-vindo ao Painel do Líder. Aqui você tem acesso aos atletas e colaboradores do seu time.</p>
            </div>

            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Colaboradores Cadastrados</span>
                </div>
                <div class="table-container">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome do Colaborador</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="lista-colaboradores">
                            <tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                                A lista automática de colaboradores será sincronizada em breve (importação futura).
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function loadLiderData() {
    if (!currentUserData || currentUserData.role !== 'lider') return;

    const equipeNome = currentUserData.equipeId || 'Minha Equipe';
    document.getElementById('equipe-titulo').innerText = equipeNome;

    const icone = document.getElementById('equipe-icone');
    if (equipeNome.includes('Azul')) icone.style.background = '#3b82f6';
    else if (equipeNome.includes('Amarela')) icone.style.background = '#eab308';
    else if (equipeNome.includes('Verde')) icone.style.background = '#10b981';
    else if (equipeNome.includes('Vermelha')) icone.style.background = '#ef4444';

    const btnLogout = document.getElementById('btn-logout-lider');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const { logoutUser } = await import('../auth.js');
            await logoutUser();
        });
    }

    if (window.lucide) window.lucide.createIcons();
}
