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
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span>Colaboradores Cadastrados</span>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <select id="filtro-modalidade-lider" class="form-control" style="width: auto; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border);">
                            <option value="">Todas as Modalidades</option>
                        </select>
                        <input type="text" id="filtro-nome-lider" placeholder="Buscar por nome ou matrícula..." class="form-control" style="max-width: 260px; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border);">
                    </div>
                </div>
                <div class="table-container">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Matrícula</th>
                                <th>Nome do Colaborador</th>
                                <th>Contato</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="lista-colaboradores">
                            <tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
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

    // Carregar Atletas da Equipe
    const { getCollection } = await import('../services/db.js');
    const todosColabs = await getCollection('colaboradores');
    const meusAtletas = todosColabs.filter(c => c.equipe === equipeNome);

    const tbody = document.getElementById('lista-colaboradores');
    const inputNome = document.getElementById('filtro-nome-lider');
    const selectModalidade = document.getElementById('filtro-modalidade-lider');

    const modalidadesLimpas = a => (a.modalidades || []).filter(m => m && !/^Coluna\s*\d+$/i.test(m));

    // Popular filtro de modalidades
    const modalidadesUnicas = new Set();
    meusAtletas.forEach(a => modalidadesLimpas(a).forEach(m => modalidadesUnicas.add(m)));
    Array.from(modalidadesUnicas).sort().forEach(m => selectModalidade.add(new Option(m, m)));

    const renderTabela = (lista) => {
        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                Nenhum colaborador encontrado.
            </td></tr>`;
            return;
        }
        tbody.innerHTML = lista.map(a => {
            const modsHTML = modalidadesLimpas(a).map(m => `<span class="badge" style="background: #e2e8f0; color: #475569; margin-right: 4px;">${m}</span>`).join('');
            return `
                <tr>
                    <td><strong>${a.matricula || '-'}</strong></td>
                    <td>
                        <div style="font-weight: 600;">${a.nome}</div>
                        <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 4px;">${modsHTML || 'Nenhuma'}</div>
                    </td>
                    <td style="color: var(--color-text-muted);">${a.whatsapp || '-'}</td>
                    <td><span class="badge badge-success">${a.status || 'Ativo'}</span></td>
                </tr>
            `;
        }).join('');
        if (window.lucide) window.lucide.createIcons();
    };

    const aplicarFiltros = () => {
        const termo = inputNome.value.toLowerCase();
        const modalidadeSelecionada = selectModalidade.value;
        const filtrados = meusAtletas.filter(a => {
            const matchTermo = !termo ||
                (a.nome && a.nome.toLowerCase().includes(termo)) ||
                (a.matricula && String(a.matricula).toLowerCase().includes(termo));
            const matchModalidade = !modalidadeSelecionada || modalidadesLimpas(a).includes(modalidadeSelecionada);
            return matchTermo && matchModalidade;
        });
        renderTabela(filtrados);
    };

    inputNome.addEventListener('input', aplicarFiltros);
    selectModalidade.addEventListener('change', aplicarFiltros);

    renderTabela(meusAtletas);
    if (window.lucide) window.lucide.createIcons();
}
