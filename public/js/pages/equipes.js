import { getCollection } from '../services/db.js';

export function renderEquipesPublicPage() {
    setTimeout(loadEquipesPublicData, 100);
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="text-align: center; margin-bottom: 3rem;">
                <h2 style="font-size: 2.5rem; color: var(--color-primary-800); margin-bottom: 0.5rem;">Delegações e Atletas</h2>
                <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
                    Conheça os atletas confirmados para a Olimcar 2026 e a distribuição por equipes.
                </p>
            </div>

            <div id="stats-equipes-public" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 3rem;">
                <!-- Stats carregadas dinamicamente -->
                <div class="card" style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i> Carregando estatísticas...</div>
            </div>

            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span>Lista de Competidores</span>
                    <input type="text" id="filtro-atletas-public" placeholder="Buscar por nome, equipe ou vínculo..." class="form-control" style="max-width: 350px; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border);">
                </div>
                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--color-surface); z-index: 10;">
                            <tr>
                                <th>Atleta</th>
                                <th>Equipe</th>
                                <th>Vínculo</th>
                            </tr>
                        </thead>
                        <tbody id="lista-atletas-public">
                            <tr><td colspan="3" style="text-align: center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i> Carregando banco de dados...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function loadEquipesPublicData() {
    const tbody = document.getElementById('lista-atletas-public');
    const statsContainer = document.getElementById('stats-equipes-public');
    const inputFiltro = document.getElementById('filtro-atletas-public');
    
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
            <h3 style="font-size: 2.5rem; margin: 0; color: var(--color-primary-800);">${total}</h3>
            <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem;">Total de Atletas</p>
        </div>`;
        
        for (const [eq, qtd] of Object.entries(stats)) {
            const cor = cores[eq] || "var(--color-primary-500)";
            htmlStats += `<div class="card" style="padding: 1.5rem; text-align: center; border-bottom: 4px solid ${cor};">
                <h3 style="font-size: 2.5rem; margin: 0; color: var(--color-text-main);">${qtd}</h3>
                <p style="margin: 0; color: var(--color-text-muted); font-size: 0.9rem; font-weight: 500;">${eq}</p>
            </div>`;
        }
        
        statsContainer.innerHTML = htmlStats;

        // Renderizar a Tabela
        const renderTabela = (lista) => {
            if (lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">Nenhum atleta encontrado.</td></tr>';
                return;
            }
            // Ordenar por equipe e depois por nome
            lista.sort((a, b) => {
                const cmpEquipe = (a.equipe || '').localeCompare(b.equipe || '');
                if (cmpEquipe !== 0) return cmpEquipe;
                return (a.nome || '').localeCompare(b.nome || '');
            });

            tbody.innerHTML = lista.map(a => `
                <tr>
                    <td style="font-weight: 500; font-size: 1.05rem;">${a.nome || 'N/A'}</td>
                    <td><span class="badge" style="background-color: ${cores[a.equipe] || 'var(--color-border)'}; color: white; padding: 0.4rem 0.8rem; font-size: 0.85rem;">${a.equipe || 'N/A'}</span></td>
                    <td style="color: var(--color-text-muted);">${a.vinculo || '-'}</td>
                </tr>
            `).join('');
        };

        // Filtro em tempo real
        inputFiltro.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = atletas.filter(a => 
                (a.nome && a.nome.toLowerCase().includes(termo)) || 
                (a.equipe && a.equipe.toLowerCase().includes(termo)) ||
                (a.vinculo && a.vinculo.toLowerCase().includes(termo))
            );
            renderTabela(filtrados);
        });

        renderTabela(atletas);
        if (window.lucide) window.lucide.createIcons();
        
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-danger);">Erro ao ler banco de dados de atletas.</td></tr>`;
        statsContainer.innerHTML = `<div class="card" style="padding: 2rem; text-align: center; color: var(--color-danger);">Não foi possível conectar.</div>`;
    }
}
