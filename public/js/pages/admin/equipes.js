import { getCollection } from '../../services/db.js';

export function renderEquipesPage() {
    setTimeout(loadEquipesData, 100);
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Gestão de Equipes e Inscritos</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <div id="stats-equipes" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <!-- Stats carregadas dinamicamente -->
                <div class="card" style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i> Carregando estatísticas...</div>
            </div>

            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span>Lista Geral de Atletas</span>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <select id="filtro-modalidade-atletas" class="form-control" style="width: auto; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border);">
                            <option value="">Todas as Modalidades</option>
                        </select>
                        <input type="text" id="filtro-atletas" placeholder="Buscar por nome, matrícula ou equipe..." class="form-control" style="max-width: 300px; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border);">
                    </div>
                </div>
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--color-surface); z-index: 10;">
                            <tr>
                                <th>Nome do Atleta</th>
                                <th>Matrícula</th>
                                <th>Contato</th>
                                <th>Equipe</th>
                                <th>Vínculo</th>
                                <th>Nº de Modalidades</th>
                            </tr>
                        </thead>
                        <tbody id="lista-atletas">
                            <tr><td colspan="6" style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i> Carregando banco de dados...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function loadEquipesData() {
    const tbody = document.getElementById('lista-atletas');
    const statsContainer = document.getElementById('stats-equipes');
    const inputFiltro = document.getElementById('filtro-atletas');
    const selectModalidade = document.getElementById('filtro-modalidade-atletas');

    if (!tbody || !statsContainer) return;

    try {
        const atletas = await getCollection('colaboradores');
        
        // Gerar Estatísticas por Equipe
        const stats = {};
        let total = 0;
        atletas.forEach(a => {
            const eq = a.equipe || "Sem Equipe";
            if (!stats[eq]) stats[eq] = 0;
            stats[eq]++;
            total++;
        });

        const cores = {
            "Equipe Azul": "var(--color-info)",
            "Equipe Vermelha": "var(--color-danger)",
            "Equipe Amarela": "var(--color-warning)",
            "Equipe Verde": "var(--color-success)",
            "Sem Equipe": "var(--color-text-muted)"
        };

        let htmlStats = `<div class="card" style="padding: 1.5rem; text-align: center; border-bottom: 4px solid var(--color-primary-600);">
            <h3 style="font-size: 2rem; margin: 0; color: var(--color-primary-800);">${total}</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem;">Total de Atletas</p>
        </div>`;
        
        for (const [eq, qtd] of Object.entries(stats)) {
            const cor = cores[eq] || "var(--color-primary-500)";
            htmlStats += `<div class="card" style="padding: 1.5rem; text-align: center; border-bottom: 4px solid ${cor};">
                <h3 style="font-size: 2rem; margin: 0; color: var(--color-text-main);">${qtd}</h3>
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem;">${eq}</p>
            </div>`;
        }
        
        statsContainer.innerHTML = htmlStats;

        // Popular filtro de modalidades (ignorando lixo de importação tipo "Coluna 53")
        const modalidadesUnicas = new Set();
        atletas.forEach(a => (a.modalidades || []).forEach(m => {
            if (m && !/^Coluna\s*\d+$/i.test(m)) modalidadesUnicas.add(m);
        }));
        Array.from(modalidadesUnicas).sort().forEach(m => selectModalidade.add(new Option(m, m)));

        // Função de Renderizar a Tabela
        const renderTabela = (lista) => {
            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>';
                return;
            }
            tbody.innerHTML = lista.map(a => `
                <tr>
                    <td style="font-weight: 500;">${a.nome || 'N/A'}</td>
                    <td style="color: var(--color-text-muted);">${a.matricula || '-'}</td>
                    <td style="color: var(--color-text-muted);">${a.whatsapp || '-'}</td>
                    <td><span class="badge" style="background-color: ${cores[a.equipe] || 'var(--color-border)'}; color: white;">${a.equipe || 'N/A'}</span></td>
                    <td style="color: var(--color-text-muted);">${a.vinculo || '-'}</td>
                    <td>${a.modalidades ? a.modalidades.length : 0} mod.</td>
                </tr>
            `).join('');
        };

        // Filtro em tempo real (texto + modalidade)
        const aplicarFiltros = () => {
            const termo = inputFiltro.value.toLowerCase();
            const modalidadeSelecionada = selectModalidade.value;
            const filtrados = atletas.filter(a => {
                const matchTermo = !termo ||
                    (a.nome && a.nome.toLowerCase().includes(termo)) ||
                    (a.equipe && a.equipe.toLowerCase().includes(termo)) ||
                    (a.matricula && String(a.matricula).toLowerCase().includes(termo));
                const matchModalidade = !modalidadeSelecionada || (a.modalidades || []).includes(modalidadeSelecionada);
                return matchTermo && matchModalidade;
            });
            renderTabela(filtrados);
        };

        inputFiltro.addEventListener('input', aplicarFiltros);
        selectModalidade.addEventListener('change', aplicarFiltros);

        renderTabela(atletas);
        if (window.lucide) window.lucide.createIcons();
        
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-danger);">Erro ao ler banco de dados.</td></tr>`;
        statsContainer.innerHTML = `<div class="card" style="padding: 2rem; text-align: center; color: var(--color-danger);">Falha de Comunicação</div>`;
    }
}
