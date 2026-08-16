// public/js/pages/arbitro_dashboard.js

let todosJogosArbitro = [];

export function renderArbitroDashboardPage() {
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Painel de Arbitragem</h2>
                <button id="btn-logout-arbitro" class="btn btn-outline" style="border-color: var(--color-danger); color: var(--color-danger);">
                    <i data-lucide="log-out"></i> Sair
                </button>
            </div>

            <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem; text-align: center; border-left: 4px solid var(--color-primary-500);">
                <p>Selecione uma partida para preencher a súmula e registrar o placar.</p>
            </div>

            <div class="card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span>Jogos</span>

                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <select id="arbitro-filter-data" class="form-control" style="width: auto; padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                            <option value="">Todas Datas</option>
                        </select>
                        <select id="arbitro-filter-modalidade" class="form-control" style="width: auto; padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                            <option value="">Todas Modalidades</option>
                        </select>
                        <select id="arbitro-filter-equipe" class="form-control" style="width: auto; padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                            <option value="">Todas as Equipes</option>
                        </select>
                    </div>
                </div>

                <div class="table-container" style="max-height: 600px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--color-surface); z-index: 10;">
                            <tr>
                                <th>Data / Hora</th>
                                <th>Modalidade</th>
                                <th>Confronto</th>
                                <th>Fase</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="lista-jogos-arbitro">
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                                    <i data-lucide="loader-2" class="spin"></i> Carregando jogos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export async function loadArbitroJogos() {
    const tbody = document.getElementById('lista-jogos-arbitro');
    if (!tbody) return;

    const btnLogout = document.getElementById('btn-logout-arbitro');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            const { logoutUser } = await import('../auth.js');
            await logoutUser();
        });
    }

    try {
        const { getCollection, sortByDateAndTime } = await import('../services/db.js');
        const jogosBrutos = await getCollection('jogos');

        todosJogosArbitro = jogosBrutos.filter(j =>
            j.modalidade_texto && j.modalidade_texto.toUpperCase() !== 'MODALIDADE' &&
            j.data_jogo && j.data_jogo.toUpperCase() !== 'DATA' && j.data_jogo.trim() !== ''
        );

        if (todosJogosArbitro.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhum jogo cadastrado.</td></tr>';
            return;
        }

        sortByDateAndTime(todosJogosArbitro);

        const datas = new Set();
        const modalidades = new Set();
        const equipes = new Set();
        todosJogosArbitro.forEach(j => {
            datas.add(j.data_jogo);
            modalidades.add(j.modalidade_texto);
            if (j.equipe_a?.nome && j.equipe_a.nome !== 'A Definir') equipes.add(j.equipe_a.nome);
            if (j.equipe_b?.nome && j.equipe_b.nome !== 'A Definir') equipes.add(j.equipe_b.nome);
        });

        const selData = document.getElementById('arbitro-filter-data');
        const selMod = document.getElementById('arbitro-filter-modalidade');
        const selEq = document.getElementById('arbitro-filter-equipe');

        Array.from(datas).sort().forEach(d => selData.add(new Option(d, d)));
        Array.from(modalidades).sort().forEach(m => selMod.add(new Option(m, m)));
        Array.from(equipes).sort().forEach(e => selEq.add(new Option(e, e)));

        selData.addEventListener('change', renderJogosArbitro);
        selMod.addEventListener('change', renderJogosArbitro);
        selEq.addEventListener('change', renderJogosArbitro);

        renderJogosArbitro();
        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Erro ao ler jogos.</td></tr>`;
    }
}

function renderJogosArbitro() {
    const tbody = document.getElementById('lista-jogos-arbitro');
    const valData = document.getElementById('arbitro-filter-data').value;
    const valMod = document.getElementById('arbitro-filter-modalidade').value;
    const valEq = document.getElementById('arbitro-filter-equipe').value;

    const filtrados = todosJogosArbitro.filter(j => {
        const matchData = !valData || j.data_jogo === valData;
        const matchMod = !valMod || j.modalidade_texto === valMod;
        const timeA = j.equipe_a?.nome || 'A Definir';
        const timeB = j.equipe_b?.nome || 'A Definir';
        const matchEq = !valEq || timeA === valEq || timeB === valEq;
        return matchData && matchMod && matchEq;
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum jogo atende aos filtros.</td></tr>';
        return;
    }

    let html = '';
    filtrados.forEach(jogo => {
        const timeA = jogo.equipe_a?.nome || 'A Definir';
        const timeB = jogo.equipe_b?.nome || 'A Definir';
        const statusBadge = jogo.status === 'encerrado' ? '<span style="color:var(--color-success); font-size: 0.7rem; display:block;">ENCERRADO</span>' : '';

        html += `
            <tr>
                <td>${jogo.data_jogo} <br> <small>${jogo.horario || '--:--'}</small></td>
                <td>${jogo.modalidade_texto}</td>
                <td>
                    <strong>${timeA}</strong> <span style="color:var(--color-text-muted);">x</span> <strong>${timeB}</strong>
                    ${jogo.status === 'encerrado' ? `<br><small style="color:var(--color-primary-500); font-weight:bold;">${jogo.placar_a} x ${jogo.placar_b}</small>` : ''}
                </td>
                <td>${jogo.fase} ${statusBadge}</td>
                <td>
                    <button onclick="window.location.hash='/admin/sumula?id=${jogo.id}'" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-primary-600); border: none;" title="Preencher Súmula e Placar">
                        <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Súmula
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
}
