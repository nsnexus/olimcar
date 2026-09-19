// public/js/services/tv_render.js — Render/paginação do Painel de TV, compartilhado
// entre o painel ao vivo (tv.js) e o gerador de imagens estáticas pro totem
// sem HDMI/browser (admin/tv_imagens.js). Uma fonte só pro HTML dos cards
// evita o card no painel ao vivo e o card na imagem baixada ficarem diferentes.

export const CORES_EQUIPE = {
    "Equipe Azul": "#2f6fed",
    "Equipe Vermelha": "#e5484d",
    "Equipe Amarela": "#ECB11F",
    "Equipe Verde": "#1CC7BE"
};

export const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

export function formatarDataBR(d = new Date()) {
    return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function corEquipe(nome) {
    return CORES_EQUIPE[nome] || 'rgba(234,250,248,0.4)';
}

export function nomeCurto(nome) {
    return (nome || 'A Definir').replace(/^Equipe\s+/i, '');
}

// Trunca com "…" na marra em vez de confiar em text-overflow:ellipsis do
// CSS — o html2canvas (gerador de imagem do totem) tem bug conhecido que
// desenha o texto duplicado/fantasma quando o navegador aplica ellipsis.
export function truncar(texto, max) {
    const t = (texto || '').toString();
    return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

export function chunk(arr, size) {
    if (arr.length === 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

// Quebra itens em páginas pela ALTURA REAL disponível dentro de `stageEl`,
// em vez de um número fixo por página — formatos diferentes (totem estreito
// x TV larga), zoom (--tv-escala) e texto que quebra linha (modalidade
// longa) mudam quantos cards cabem sem cortar nem gerar scrollbar.
// Renderiza os itens todos de uma vez num container invisível fora da tela
// (no MESMO document de stageEl, pra herdar o CSS certo — importante pro
// gerador de imagens, que mede dentro de um <iframe> isolado), mede a
// altura de cada LINHA do grid e decide os cortes de página por aí.
export function paginarPorAltura(itens, criarCardFn, gridClass, tituloAmostraHtml, stageEl) {
    if (itens.length === 0) return [];
    if (!stageEl) return chunk(itens, 8);
    const doc = stageEl.ownerDocument;

    const rect = stageEl.getBoundingClientRect();
    const medidor = doc.createElement('div');
    medidor.style.cssText = `position:fixed; left:-9999px; top:0; width:${rect.width}px; height:${rect.height}px; visibility:hidden; pointer-events:none;`;
    medidor.innerHTML = `<section class="tv-slide" style="opacity:1;transform:none;animation:none;">${tituloAmostraHtml}<div class="${gridClass}">${itens.map(criarCardFn).join('')}</div></section>`;
    doc.body.appendChild(medidor);

    try {
        const grid = medidor.querySelector(`.${gridClass}`);
        const cards = grid ? Array.from(grid.children) : [];
        if (!grid || cards.length === 0) return chunk(itens, 8);

        // -2px de folga: com muitas linhas finas (tabela do totem, ~20/página)
        // um arredondamento subpixel por linha acumula e a última linha podia
        // sair uns 2px cortada pelo overflow:hidden do .tv-slide.
        const alturaDisponivel = (medidor.getBoundingClientRect().bottom - grid.getBoundingClientRect().top) - 2;
        const gapPx = parseFloat(getComputedStyle(grid).rowGap) || 0;

        // Agrupa cards em "linhas" do grid (1 coluna no totem/faixa, 2 no padrão)
        const linhas = [];
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const ultima = linhas[linhas.length - 1];
            if (ultima && Math.abs(ultima.top - cardRect.top) < 2) {
                ultima.altura = Math.max(ultima.altura, cardRect.height);
                ultima.qtd++;
            } else {
                linhas.push({ top: cardRect.top, altura: cardRect.height, qtd: 1 });
            }
        });

        const paginas = [];
        let paginaAtual = [];
        let usado = 0;
        let itemIdx = 0;
        linhas.forEach(linha => {
            const custoComGap = linha.altura + (paginaAtual.length > 0 ? gapPx : 0);
            if (paginaAtual.length > 0 && usado + custoComGap > alturaDisponivel) {
                paginas.push(paginaAtual);
                paginaAtual = [];
                usado = 0;
            }
            const custoReal = linha.altura + (paginaAtual.length > 0 ? gapPx : 0);
            paginaAtual.push(...itens.slice(itemIdx, itemIdx + linha.qtd));
            itemIdx += linha.qtd;
            usado += custoReal;
        });
        if (paginaAtual.length) paginas.push(paginaAtual);
        return paginas.length ? paginas : chunk(itens, 8);
    } finally {
        doc.body.removeChild(medidor);
    }
}

// ---------- CARDS: JOGOS DO DIA ----------

export function criarCardJogo(j, i) {
    const timeA = j.equipe_a?.nome || 'A Definir';
    const timeB = j.equipe_b?.nome || 'A Definir';
    const live = j.status === 'ao_vivo';
    return `
        <div class="tv-game-card ${live ? 'is-live' : ''}" style="animation-delay:${i * 0.06}s">
            <div class="tv-game-time">${j.horario || '--:--'}</div>
            <div class="tv-game-info">
                <div class="tv-game-modalidade">${j.modalidade_texto || ''} ${live ? '<span class="tv-live-badge"><span class="tv-live-dot"></span> AO VIVO</span>' : ''}</div>
                <div class="tv-game-meta">${j.fase || 'Fase Única'} · ${j.local || 'Local a definir'}</div>
            </div>
            <div class="tv-game-teams">
                <span class="tv-team-dot" style="background:${corEquipe(timeA)}"></span>
                <span>${nomeCurto(timeA)}</span>
                <span class="tv-game-vs">×</span>
                <span class="tv-team-dot" style="background:${corEquipe(timeB)}"></span>
                <span>${nomeCurto(timeB)}</span>
            </div>
        </div>
    `;
}

export function renderJogos(pagina, indicePagina, totalPaginas, dataFmt) {
    const cards = pagina.map(criarCardJogo).join('');
    return `
        <h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje
            <span class="tv-slide-subtitle">${dataFmt}${totalPaginas > 1 ? ` · página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-games-grid">${cards}</div>
    `;
}

// Linha compacta (1 jogo por linha, em vez do card grande) — usada só no
// gerador de imagem estática pro totem sem HDMI: o objetivo lá é caber TODOS
// os jogos do dia em poucas imagens, não impressionar de longe como o
// painel ao vivo.
export function criarLinhaJogoTabela(j) {
    const timeA = j.equipe_a?.nome || 'A Definir';
    const timeB = j.equipe_b?.nome || 'A Definir';
    // Sem truncar modalidade/fase: a linha quebra pra 2ª linha se precisar
    // (CSS: .tv-row-mod sem nowrap) em vez de cortar no meio da palavra —
    // a altura do card é medida de verdade depois (paginarPorAltura), então
    // uma linha a mais só deixa ESSE card um pouco maior, nunca corta texto.
    return `
        <div class="tv-row-jogo">
            <div class="tv-row-jogo-top">
                <span class="tv-row-hora">${j.horario || '--:--'}</span>
                <span class="tv-row-mod">${j.modalidade_texto || ''}${j.fase ? `<small> · ${j.fase}</small>` : ''}</span>
            </div>
            <div class="tv-row-times">
                <span class="tv-team-dot" style="background:${corEquipe(timeA)}"></span>${truncar(nomeCurto(timeA), 14)}
                <span class="tv-row-x">×</span>
                <span class="tv-team-dot" style="background:${corEquipe(timeB)}"></span>${truncar(nomeCurto(timeB), 14)}
            </div>
        </div>
    `;
}

export function renderTabelaJogos(pagina, indicePagina, totalPaginas, dataFmt) {
    const linhas = pagina.map(criarLinhaJogoTabela).join('');
    return `
        <h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje
            <span class="tv-slide-subtitle">${dataFmt}${totalPaginas > 1 ? ` · página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-table-jogos">${linhas}</div>
    `;
}

export function renderJogosVazio(dataFmt) {
    return `
        <h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje
            <span class="tv-slide-subtitle">${dataFmt}</span>
        </h2>
        <div class="tv-empty">
            <i data-lucide="calendar-x"></i>
            <div class="tv-empty-title">Nenhum jogo agendado</div>
            <div class="tv-empty-text">Confira a agenda completa no site oficial da Olimcar.</div>
        </div>
    `;
}

// ---------- CARDS: PLACARES DO DIA ----------

export function criarCardPlacar(j, i) {
    const timeA = j.equipe_a?.nome || 'A Definir';
    const timeB = j.equipe_b?.nome || 'A Definir';
    return `
        <div class="tv-score-card" style="animation-delay:${i * 0.06}s">
            <div class="tv-score-row">
                <div class="tv-score-team"><span class="tv-team-dot" style="background:${corEquipe(timeA)}"></span><span class="name">${nomeCurto(timeA)}</span></div>
                <div class="tv-score-value">${j.placar_a ?? 0}</div>
            </div>
            <div class="tv-score-divider"></div>
            <div class="tv-score-row">
                <div class="tv-score-team"><span class="tv-team-dot" style="background:${corEquipe(timeB)}"></span><span class="name">${nomeCurto(timeB)}</span></div>
                <div class="tv-score-value">${j.placar_b ?? 0}</div>
            </div>
            <div class="tv-score-footer"><span>${j.modalidade_texto || ''}</span><span>${j.fase || ''}</span></div>
        </div>
    `;
}

export function renderPlacares(pagina, indicePagina, totalPaginas) {
    const cards = pagina.map(criarCardPlacar).join('');
    return `
        <h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje
            <span class="tv-slide-subtitle">${totalPaginas > 1 ? `página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-scores-grid">${cards}</div>
    `;
}

// Linha compacta de placar (mesmo espírito de criarLinhaJogoTabela)
export function criarLinhaPlacarTabela(j) {
    const timeA = j.equipe_a?.nome || 'A Definir';
    const timeB = j.equipe_b?.nome || 'A Definir';
    return `
        <div class="tv-row-placar">
            <div class="tv-row-jogo-top">
                <span class="tv-row-mod">${j.modalidade_texto || ''}${j.fase ? `<small> · ${j.fase}</small>` : ''}</span>
            </div>
            <div class="tv-row-placar-times">
                <span class="tv-team-dot" style="background:${corEquipe(timeA)}"></span>${truncar(nomeCurto(timeA), 12)}
                <span class="tv-row-placar-score">${j.placar_a ?? 0} × ${j.placar_b ?? 0}</span>
                <span class="tv-team-dot" style="background:${corEquipe(timeB)}"></span>${truncar(nomeCurto(timeB), 12)}
            </div>
        </div>
    `;
}

export function renderTabelaPlacares(pagina, indicePagina, totalPaginas) {
    const linhas = pagina.map(criarLinhaPlacarTabela).join('');
    return `
        <h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje
            <span class="tv-slide-subtitle">${totalPaginas > 1 ? `página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-table-placares">${linhas}</div>
    `;
}

export function renderPlacaresVazio() {
    return `
        <h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje</h2>
        <div class="tv-empty">
            <i data-lucide="hourglass"></i>
            <div class="tv-empty-title">Nenhum resultado registrado ainda</div>
            <div class="tv-empty-text">Assim que os jogos forem encerrados, os placares aparecem aqui.</div>
        </div>
    `;
}

// ---------- TABELA: QUADRO DE MEDALHAS ----------
// item = { equipe, pontos, medalhas: {1,2,3}, posicao } — monta esse
// formato antes de chunkar (calcularRanking devolve tupla + mapa separado).
export function criarLinhaMedalha(item) {
    const medalhas = item.medalhas || {};
    return `
        <div class="tv-row-medalha">
            <span class="tv-row-medalha-rank">${item.posicao}º</span>
            <span class="tv-row-medalha-nome"><span class="tv-team-dot" style="background:${corEquipe(item.equipe)}"></span>${truncar(nomeCurto(item.equipe), 16)}</span>
            <span class="tv-row-medalha-badges">🥇${medalhas[1] || 0} 🥈${medalhas[2] || 0} 🥉${medalhas[3] || 0} <small>4º ${medalhas[4] || 0}</small></span>
            <span class="tv-row-medalha-pontos">${item.pontos}<small>pts</small></span>
        </div>
    `;
}

export function renderTabelaMedalhas(pagina, indicePagina, totalPaginas) {
    const linhas = pagina.map(criarLinhaMedalha).join('');
    return `
        <h2 class="tv-slide-title"><i data-lucide="medal"></i> Quadro de Medalhas
            <span class="tv-slide-subtitle">${totalPaginas > 1 ? `página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-table-medalhas">${linhas}</div>
    `;
}

export function renderMedalhasVazio() {
    return `
        <h2 class="tv-slide-title"><i data-lucide="medal"></i> Quadro de Medalhas</h2>
        <div class="tv-empty">
            <i data-lucide="medal"></i>
            <div class="tv-empty-title">Pontuação em breve</div>
            <div class="tv-empty-text">O quadro é atualizado conforme os jogos vão sendo encerrados.</div>
        </div>
    `;
}
