import { getCollection, sortByDateAndTime } from '../services/db.js';

let todosJogos = []; // Estado local para os filtros

export function renderAgendaPage() {
    // Dispara o carregamento assíncrono após o HTML estar no DOM
    setTimeout(loadAgenda, 100);

    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                <h2>Agenda de Jogos</h2>
                
                <div class="filtros-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <select id="filter-data" class="form-control" style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.9rem;">
                        <option value="">Todas as Datas</option>
                    </select>
                    <select id="filter-modalidade" class="form-control" style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.9rem;">
                        <option value="">Todas as Modalidades</option>
                    </select>
                    <select id="filter-equipe" class="form-control" style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--color-border); font-size: 0.9rem;">
                        <option value="">Todas as Equipes</option>
                    </select>
                </div>
            </div>
            
            <div id="agenda-loading" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
                <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                <p style="margin-top: 1rem;">Carregando tabela oficial...</p>
            </div>
            
            <div id="agenda-content" style="display: none;">
                <div class="table-container">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Data / Hora</th>
                                <th>Modalidade</th>
                                <th>Confronto</th>
                                <th>Local e Fase</th>
                            </tr>
                        </thead>
                        <tbody id="agenda-lista">
                            <!-- Injetado por JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

async function loadAgenda() {
    const loadingDiv = document.getElementById('agenda-loading');
    const contentDiv = document.getElementById('agenda-content');
    
    if (!loadingDiv) return;

    try {
        const jogosBrutos = await getCollection('jogos');
        
        // Filtrar possíveis lixos de cabeçalho (Excel import error)
        todosJogos = jogosBrutos.filter(j => 
            j.modalidade_texto && 
            j.modalidade_texto.toUpperCase() !== 'MODALIDADE' &&
            j.data_jogo && 
            j.data_jogo.toUpperCase() !== 'DATA' &&
            j.data_jogo.trim() !== ''
        );
        
        if (todosJogos.length === 0) {
            loadingDiv.innerHTML = '<p>Nenhum jogo cadastrado ainda.</p>';
            return;
        }

        // Ordenar por Data e Horário
        sortByDateAndTime(todosJogos);

        preencherOpcoesFiltro();
        renderFilteredJogos();
        
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
        // Listeners de filtro
        document.getElementById('filter-data').addEventListener('change', renderFilteredJogos);
        document.getElementById('filter-modalidade').addEventListener('change', renderFilteredJogos);
        document.getElementById('filter-equipe').addEventListener('change', renderFilteredJogos);
        
    } catch (e) {
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar a agenda. Tente novamente.</p>';
    }
}

function preencherOpcoesFiltro() {
    const datas = new Set();
    const modalidades = new Set();
    const equipes = new Set();

    todosJogos.forEach(jogo => {
        if(jogo.data_jogo) datas.add(jogo.data_jogo);
        if(jogo.modalidade_texto) modalidades.add(jogo.modalidade_texto);
        if(jogo.equipe_a?.nome && jogo.equipe_a.nome !== 'A Definir') equipes.add(jogo.equipe_a.nome);
        if(jogo.equipe_b?.nome && jogo.equipe_b.nome !== 'A Definir') equipes.add(jogo.equipe_b.nome);
    });

    const selectData = document.getElementById('filter-data');
    Array.from(datas).sort().forEach(d => selectData.add(new Option(d, d)));

    const selectModalidade = document.getElementById('filter-modalidade');
    Array.from(modalidades).sort().forEach(m => selectModalidade.add(new Option(m, m)));

    const selectEquipe = document.getElementById('filter-equipe');
    Array.from(equipes).sort().forEach(e => selectEquipe.add(new Option(e, e)));
}

function renderFilteredJogos() {
    const tbody = document.getElementById('agenda-lista');
    const valData = document.getElementById('filter-data').value;
    const valModalidade = document.getElementById('filter-modalidade').value;
    const valEquipe = document.getElementById('filter-equipe').value;

    const jogosFiltrados = todosJogos.filter(jogo => {
        const timeA = jogo.equipe_a?.nome || 'A Definir';
        const timeB = jogo.equipe_b?.nome || 'A Definir';
        
        const matchData = !valData || jogo.data_jogo === valData;
        const matchModalidade = !valModalidade || jogo.modalidade_texto === valModalidade;
        const matchEquipe = !valEquipe || timeA === valEquipe || timeB === valEquipe;
        
        return matchData && matchModalidade && matchEquipe;
    });

    if (jogosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Nenhum jogo encontrado para os filtros selecionados.</td></tr>';
        return;
    }

    let html = '';
    jogosFiltrados.forEach(jogo => {
        const timeA = jogo.equipe_a?.nome || 'A Definir';
        const timeB = jogo.equipe_b?.nome || 'A Definir';
        
        html += `
            <tr>
                <td>
                    <div style="font-weight: 500;">${jogo.data_jogo}</div>
                    <div style="font-size: 0.85rem; color: var(--color-text-muted);">${jogo.horario || '--:--'}</div>
                </td>
                <td>
                    <span style="display: inline-block; padding: 0.25rem 0.5rem; background: var(--color-surface-hover); border-radius: 4px; font-size: 0.85rem;">
                        ${jogo.modalidade_texto}
                    </span>
                </td>
                <td style="text-align: center; font-weight: bold;">
                    <span style="color: var(--color-text-main);">${timeA}</span>
                    <span style="margin: 0 0.5rem; color: var(--color-text-muted); font-size: 0.8rem;">X</span>
                    <span style="color: var(--color-text-main);">${timeB}</span>
                </td>
                <td>
                    <div style="font-size: 0.9rem;">${jogo.fase || 'Fase Única'}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-muted);"><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline; vertical-align: middle;"></i> ${jogo.local || 'Local não definido'}</div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    if (window.lucide) {
        window.lucide.createIcons();
    }
}
