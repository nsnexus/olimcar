import { getCollection, sortByDateAndTime } from '../services/db.js';

const CORES_EQUIPE = {
    "Equipe Azul": "var(--color-info)",
    "Equipe Vermelha": "var(--color-danger)",
    "Equipe Amarela": "var(--color-warning)",
    "Equipe Verde": "var(--color-success)"
};

function chipEquipe(nome) {
    const cor = CORES_EQUIPE[nome] || "var(--color-text-light)";
    const label = (nome || 'A Definir').replace(/^Equipe\s+/i, '');
    return `<span style="display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cor}; display: inline-block; flex-shrink: 0;"></span>${label}
    </span>`;
}

export function renderResultadosPage() {
    setTimeout(loadResultados, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 3rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <h2>Resultados</h2>
                <select id="filter-resultados-modalidade" class="form-control" style="width: auto; padding: 0.5rem 0.75rem; border-radius: 4px; border: 1px solid var(--color-border);">
                    <option value="">Todas as Modalidades</option>
                </select>
            </div>

            <div id="resultados-loading" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
                <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                <p style="margin-top: 1rem;">Carregando resultados...</p>
            </div>

            <div id="resultados-lista" style="display: none; display: flex; flex-direction: column; gap: 1rem;"></div>
        </div>
    `;
}

async function loadResultados() {
    const loadingDiv = document.getElementById('resultados-loading');
    const listaDiv = document.getElementById('resultados-lista');
    const selectModalidade = document.getElementById('filter-resultados-modalidade');

    if (!loadingDiv) return;

    try {
        const jogosBrutos = await getCollection('jogos');
        const encerrados = jogosBrutos.filter(j => j.status === 'encerrado' && j.modalidade_texto);

        sortByDateAndTime(encerrados);
        encerrados.reverse(); // Mais recentes primeiro

        const modalidades = [...new Set(encerrados.map(j => j.modalidade_texto))].sort();
        modalidades.forEach(m => selectModalidade.add(new Option(m, m)));

        const renderLista = (lista) => {
            if (lista.length === 0) {
                listaDiv.innerHTML = `<div class="card" style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
                    Nenhum resultado oficializado ainda. Volte em breve!
                </div>`;
                return;
            }

            listaDiv.innerHTML = lista.map(jogo => {
                const cabecalho = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                        <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-primary-600); background: var(--color-primary-50); padding: 0.3rem 0.6rem; border-radius: 4px;">${jogo.modalidade_texto}</span>
                        <span style="font-size: 0.8rem; color: var(--color-text-muted);">${jogo.fase || 'Fase Única'} &bull; ${jogo.data_jogo || ''}</span>
                    </div>
                `;

                if (jogo.colocacoes && Object.keys(jogo.colocacoes).length > 0) {
                    const ranking = Object.entries(jogo.colocacoes).sort((a, b) => a[1] - b[1]);
                    const medalhas = { 1: '🥇', 2: '🥈', 3: '🥉', 4: '4º' };
                    return `
                    <div class="card" style="padding: 1.5rem;">
                        ${cabecalho}
                        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                            ${ranking.map(([equipe, pos]) => `
                                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: var(--color-bg-body); border-radius: var(--radius-sm);">
                                    <span style="font-weight: 800; width: 1.5rem;">${medalhas[pos] || pos + 'º'}</span>
                                    ${chipEquipe(equipe)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                }

                const timeA = jogo.equipe_a?.nome;
                const timeB = jogo.equipe_b?.nome;
                const placarA = jogo.placar_a ?? 0;
                const placarB = jogo.placar_b ?? 0;
                const venceuA = placarA > placarB;
                const venceuB = placarB > placarA;

                return `
                <div class="card" style="padding: 1.5rem;">
                    ${cabecalho}
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem;">
                        <div style="flex: 1; text-align: right; font-weight: ${venceuA ? 800 : 500}; opacity: ${venceuB ? 0.55 : 1};">
                            ${chipEquipe(timeA)}
                        </div>
                        <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-main); white-space: nowrap;">
                            ${placarA} <span style="color: var(--color-text-light); font-size: 1rem;">x</span> ${placarB}
                        </div>
                        <div style="flex: 1; text-align: left; font-weight: ${venceuB ? 800 : 500}; opacity: ${venceuA ? 0.55 : 1};">
                            ${chipEquipe(timeB)}
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        };

        selectModalidade.addEventListener('change', (e) => {
            const val = e.target.value;
            renderLista(val ? encerrados.filter(j => j.modalidade_texto === val) : encerrados);
        });

        renderLista(encerrados);

        loadingDiv.style.display = 'none';
        listaDiv.style.display = 'flex';
        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        console.error(e);
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar os resultados.</p>';
    }
}
