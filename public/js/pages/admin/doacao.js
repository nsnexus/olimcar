// public/js/pages/admin/doacao.js — Lança o kg de alimento arrecadado por
// equipe (Art. 24, V do regulamento). Guarda tudo num único jogo "virtual"
// (categoria='doacao', fase='PROVA') pra reaproveitar 100% do cálculo de
// pontos já existente (ranking.js): a colocação (1º-4º por kg) é derivada
// automaticamente aqui e salva como jogo.colocacoes — o mesmo formato de
// qualquer PROVA — e o bônus por equipe que bateu a meta fica em
// jogo.kg_arrecadado, lido à parte em calcularRanking/gerarExtratoPontuacao.
import { getCollection, addDocument, updateDocument, getTabelaPontuacao } from '../../services/db.js?v=20260917b';

const MODALIDADE_DOACAO = 'ARRECADAÇÃO DE ALIMENTOS NÃO PERECÍVEIS';

export function renderDoacaoAdminPage() {
    setTimeout(carregarPagina, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem; max-width: 720px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Arrecadação de Alimentos</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                Art. 24, V do regulamento: meta de 1 tonelada por equipe até 27/09/2026 10h.
                Quem bate a meta ganha o bônus fixo, à parte da colocação por volume arrecadado.
                Meta e bônus são editáveis em <a href="#/admin/pontuacao">Conferência de Pontuação</a>.
            </p>

            <div id="doacao-loading" style="text-align:center; padding:3rem; color:var(--color-text-muted);">
                <i data-lucide="loader-2" class="spin"></i> Carregando...
            </div>

            <div id="doacao-content" style="display:none;">
                <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div id="doacao-linhas" style="display: flex; flex-direction: column; gap: 1rem;"></div>

                    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
                        <label class="form-label">Status</label>
                        <select id="doacao-status" class="form-control" style="max-width: 260px; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--color-border);">
                            <option value="agendado">Em andamento (ainda não conta pro ranking)</option>
                            <option value="encerrado">Encerrado (já conta pro ranking)</option>
                        </select>
                    </div>

                    <div style="display:flex; align-items:center; gap:1rem; margin-top:1.5rem;">
                        <button id="btn-salvar-doacao" class="btn btn-primary"><i data-lucide="save"></i> Salvar</button>
                        <span id="msg-doacao" style="font-size:0.85rem;"></span>
                    </div>
                </div>

                <div class="card" style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 1rem; font-size: 1rem;">Prévia da colocação e pontos</h3>
                    <div id="doacao-preview"></div>
                </div>
            </div>
        </div>
    `;
}

const CORES_EQUIPE = {
    "Equipe Azul": "#3b82f6",
    "Equipe Vermelha": "#ef4444",
    "Equipe Amarela": "#eab308",
    "Equipe Verde": "#10b981"
};

function chipEquipe(nome) {
    const cor = CORES_EQUIPE[nome] || '#94a3b8';
    return `<span style="display:inline-flex; align-items:center; gap:0.35rem; white-space:nowrap;">
        <span style="width:9px; height:9px; border-radius:50%; background:${cor}; flex-shrink:0;"></span>${(nome || '').replace(/^Equipe\s+/i, '')}
    </span>`;
}

let equipesCache = [];
let jogoDoacaoCache = null;
let tabelaPontuacaoCache = null;

async function carregarPagina() {
    const loadingDiv = document.getElementById('doacao-loading');
    if (!loadingDiv) return;

    try {
        const [jogos, equipes, tabelaPontuacao] = await Promise.all([
            getCollection('jogos', { force: true }),
            getCollection('equipes'),
            getTabelaPontuacao()
        ]);
        equipesCache = equipes;
        tabelaPontuacaoCache = tabelaPontuacao;
        jogoDoacaoCache = jogos.find(j => j.categoria === 'doacao') || null;

        renderLinhas();
        document.getElementById('doacao-status').value = jogoDoacaoCache?.status || 'agendado';
        document.getElementById('btn-salvar-doacao').addEventListener('click', salvarDoacao);

        loadingDiv.style.display = 'none';
        document.getElementById('doacao-content').style.display = 'block';
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        console.error('Erro ao carregar arrecadação:', e);
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar. Tente novamente.</p>';
    }
}

function renderLinhas() {
    const el = document.getElementById('doacao-linhas');
    const kgAtual = jogoDoacaoCache?.kg_arrecadado || {};

    el.innerHTML = equipesCache.map(eq => `
        <div style="display:flex; align-items:center; gap:1rem;">
            <div style="min-width: 140px;">${chipEquipe(eq.nome)}</div>
            <input type="number" min="0" step="1" class="form-control input-kg" data-equipe="${eq.nome}"
                value="${kgAtual[eq.nome] ?? ''}" placeholder="0" style="max-width: 140px; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--color-border);">
            <span style="color: var(--color-text-muted); font-size: 0.9rem;">kg</span>
        </div>
    `).join('');

    el.querySelectorAll('.input-kg').forEach(input => input.addEventListener('input', renderPreview));
    renderPreview();
}

function lerKgAtual() {
    const kg = {};
    document.querySelectorAll('.input-kg').forEach(input => {
        kg[input.dataset.equipe] = Number(input.value) || 0;
    });
    return kg;
}

// Colocação (1º-4º) derivada por quem arrecadou mais — desempate: quem
// digitou primeiro na lista de equipes (não há critério no regulamento).
function calcularColocacoes(kg) {
    const ordenado = Object.entries(kg).sort((a, b) => b[1] - a[1]);
    const colocacoes = {};
    ordenado.forEach(([equipe], i) => { colocacoes[equipe] = i + 1; });
    return colocacoes;
}

function renderPreview() {
    const el = document.getElementById('doacao-preview');
    const kg = lerKgAtual();
    const colocacoes = calcularColocacoes(kg);
    const { meta_kg, bonus_meta, ...pontosColocacao } = tabelaPontuacaoCache.doacao;

    const linhas = Object.entries(colocacoes).sort((a, b) => a[1] - b[1]).map(([equipe, posicao]) => {
        const pontosPos = pontosColocacao[posicao] ?? 0;
        const bateuMeta = kg[equipe] >= meta_kg;
        const total = pontosPos + (bateuMeta ? bonus_meta : 0);
        return `
            <div style="display:flex; align-items:center; gap:0.75rem; padding:0.5rem 0; border-bottom:1px solid var(--color-border);">
                <strong style="min-width:2em;">${posicao}º</strong>
                ${chipEquipe(equipe)}
                <span style="color:var(--color-text-muted); font-size:0.85rem;">${kg[equipe]}kg</span>
                <span style="margin-left:auto; text-align:right;">
                    <div style="font-weight:700; color:var(--color-primary-600);">+${total}pt</div>
                    <div style="font-size:0.75rem; color:var(--color-text-muted);">${pontosPos}pt colocação${bateuMeta ? ` + ${bonus_meta}pt meta` : ''}</div>
                </span>
            </div>
        `;
    }).join('');

    el.innerHTML = linhas || '<p style="color:var(--color-text-muted);">Nenhum kg lançado ainda.</p>';
}

async function salvarDoacao() {
    const btn = document.getElementById('btn-salvar-doacao');
    const msg = document.getElementById('msg-doacao');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando...';
    if (window.lucide) window.lucide.createIcons();

    const kg = lerKgAtual();
    const colocacoes = calcularColocacoes(kg);
    const status = document.getElementById('doacao-status').value;

    const dados = {
        modalidade_texto: MODALIDADE_DOACAO,
        fase: 'PROVA',
        categoria: 'doacao',
        status,
        kg_arrecadado: kg,
        colocacoes,
        equipe_a: { nome: 'Todas as Equipes' },
        equipe_b: { nome: 'A Definir' },
        placar_a: 0,
        placar_b: 0
    };

    let sucesso;
    if (jogoDoacaoCache?.id) {
        sucesso = await updateDocument('jogos', jogoDoacaoCache.id, dados);
    } else {
        dados.criado_em = new Date().toISOString();
        const novoId = await addDocument('jogos', dados);
        sucesso = !!novoId;
        if (novoId) jogoDoacaoCache = { id: novoId, ...dados };
    }

    if (sucesso) {
        if (jogoDoacaoCache) Object.assign(jogoDoacaoCache, dados);
        msg.style.color = 'var(--color-success)';
        msg.innerText = status === 'encerrado' ? 'Salvo! Já conta pro ranking.' : 'Salvo (ainda não conta pro ranking — status não é "Encerrado").';
    } else {
        msg.style.color = 'var(--color-danger)';
        msg.innerText = 'Erro ao salvar. Verifique sua permissão.';
    }

    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => { msg.innerText = ''; }, 4000);
}
