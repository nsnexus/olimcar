// public/js/pages/agenda.js
import { getCollection } from '../services/db.js';

export function renderAgendaPage() {
    // Dispara o carregamento assíncrono após o HTML estar no DOM
    setTimeout(loadAgenda, 100);

    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Agenda de Jogos</h2>
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
    const tbody = document.getElementById('agenda-lista');
    
    if (!tbody) return;

    try {
        const jogos = await getCollection('jogos');
        
        if (jogos.length === 0) {
            loadingDiv.innerHTML = '<p>Nenhum jogo cadastrado ainda.</p>';
            return;
        }

        // Ordenar por Data (simples)
        jogos.sort((a, b) => a.data_jogo.localeCompare(b.data_jogo));

        let html = '';
        jogos.forEach(jogo => {
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
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (e) {
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar a agenda. Tente novamente.</p>';
    }
}
