// public/js/pages/admin/pontuacao.js — Conferência de pontuação: 1 linha por
// jogo/prova encerrado, mostrando categoria, colocação (1º a 4º) e pontos
// que cada equipe ganhou ali. Existe pra auditar rápido casos como jogo
// sem categoria (não pontua e passa despercebido no quadro de medalhas).
// Também deixa editar, sem mexer em código: a tabela de pontos por
// colocação (meta/tabela_pontuacao) e a categoria de cada jogo.
import { getCollection, updateDocument, setDocument, getTabelaPontuacao, CATEGORIAS_PONTUACAO } from '../../services/db.js?v=20260917b';
import { calcularRanking, gerarExtratoPontuacao } from '../../pages/ranking.js?v=20260917b';

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

export function renderPontuacaoAdminPage() {
    setTimeout(carregarPagina, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2>Conferência de Pontuação</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 0.4rem;">Pontos por colocação</h3>
                <p style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 1.25rem; max-width: 640px;">
                    O que cada categoria vale hoje pra 1º, 2º, 3º e 4º lugar. Corrija se estiver errado —
                    aplica em tudo (Ranking, Painel de TV, imagens do totem) assim que salvar.
                </p>
                <div id="tabela-pontos-form"></div>
                <div style="display:flex; align-items:center; gap:1rem; margin-top:1.25rem;">
                    <button id="btn-salvar-tabela-pontos" class="btn btn-primary"><i data-lucide="save"></i> Salvar tabela de pontos</button>
                    <span id="msg-tabela-pontos" style="font-size:0.85rem;"></span>
                </div>
            </div>

            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 700px;">
                Todo jogo/prova encerrado, com a categoria usada, a colocação de cada equipe e os pontos ganhos.
                Categoria errada? Troca ali mesmo na linha. Linhas em
                <span style="color:var(--color-danger); font-weight:600;">vermelho</span> não pontuaram — confira o motivo.
            </p>

            <div id="pontuacao-resumo" style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;"></div>

            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                <select id="filtro-categoria-pont" class="form-control" style="width: auto; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--color-border);">
                    <option value="">Todas as categorias</option>
                </select>
                <label style="display:flex; align-items:center; gap:0.4rem; font-size:0.9rem; color:var(--color-text-muted);">
                    <input type="checkbox" id="filtro-so-problemas"> Só o que não pontuou
                </label>
            </div>

            <div id="pontuacao-loading" style="text-align:center; padding:3rem; color:var(--color-text-muted);">
                <i data-lucide="loader-2" class="spin"></i> Calculando...
            </div>

            <div class="table-container" id="pontuacao-tabela-wrap" style="display:none;">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Modalidade</th>
                            <th>Fase</th>
                            <th>Categoria</th>
                            <th>Colocação e pontos</th>
                        </tr>
                    </thead>
                    <tbody id="pontuacao-lista"></tbody>
                </table>
            </div>
        </div>
    `;
}

let extratoCache = [];
let tabelaPontuacaoCache = null;
let jogosCache = [];
let equipesCache = [];

async function carregarPagina() {
    const loadingDiv = document.getElementById('pontuacao-loading');
    if (!loadingDiv) return;

    try {
        const [jogos, equipes, tabelaPontuacao] = await Promise.all([
            getCollection('jogos', { force: true }),
            getCollection('equipes'),
            getTabelaPontuacao()
        ]);
        jogosCache = jogos;
        equipesCache = equipes;
        tabelaPontuacaoCache = tabelaPontuacao;

        renderFormTabelaPontos();
        document.getElementById('btn-salvar-tabela-pontos').addEventListener('click', salvarTabelaPontos);

        recalcular();

        document.getElementById('filtro-categoria-pont').addEventListener('change', renderTabela);
        document.getElementById('filtro-so-problemas').addEventListener('change', renderTabela);

        loadingDiv.style.display = 'none';
        document.getElementById('pontuacao-tabela-wrap').style.display = 'block';
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        console.error('Erro ao carregar conferência de pontuação:', e);
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao calcular. Tente novamente.</p>';
    }
}

// Recalcula ranking + extrato a partir do cache local (sem reler o banco) —
// usado depois de editar categoria de um jogo ou salvar a tabela de pontos.
function recalcular() {
    const { ranking } = calcularRanking(jogosCache, equipesCache, tabelaPontuacaoCache);
    extratoCache = gerarExtratoPontuacao(jogosCache, equipesCache, tabelaPontuacaoCache);
    renderResumo(ranking);
    preencherFiltroCategoria();
    renderTabela();
}

function renderFormTabelaPontos() {
    const el = document.getElementById('tabela-pontos-form');
    el.innerHTML = `
        <div class="table-container">
            <table style="width:100%;">
                <thead>
                    <tr>
                        <th>Categoria</th>
                        <th style="text-align:center;">1º</th>
                        <th style="text-align:center;">2º</th>
                        <th style="text-align:center;">3º</th>
                        <th style="text-align:center;">4º</th>
                        <th style="text-align:center;">Por conclusão</th>
                        <th style="text-align:center;">Meta (kg)</th>
                        <th style="text-align:center;">Bônus meta</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(CATEGORIAS_PONTUACAO).map(([chave, label]) => {
                        const valores = tabelaPontuacaoCache[chave] || {};
                        const campo = (posicao, largura = 70) => `<td style="text-align:center;"><input type="number" class="form-control input-ponto" data-categoria="${chave}" data-posicao="${posicao}" value="${valores[posicao] ?? ''}" style="width:${largura}px; text-align:center; padding:0.4rem;"></td>`;
                        return `
                            <tr>
                                <td style="font-size:0.9rem;">${label}</td>
                                ${campo(1)}${campo(2)}${campo(3)}${campo(4)}
                                ${chave === 'corrida' ? campo('conclusao') : '<td></td>'}
                                ${chave === 'doacao' ? campo('meta_kg', 85) : '<td></td>'}
                                ${chave === 'doacao' ? campo('bonus_meta') : '<td></td>'}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function salvarTabelaPontos() {
    const btn = document.getElementById('btn-salvar-tabela-pontos');
    const msg = document.getElementById('msg-tabela-pontos');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando...';
    if (window.lucide) window.lucide.createIcons();

    const novaTabela = {};
    document.querySelectorAll('.input-ponto').forEach(input => {
        const categoria = input.dataset.categoria;
        const posicao = input.dataset.posicao;
        const valor = input.value === '' ? null : Number(input.value);
        if (valor === null || Number.isNaN(valor)) return;
        novaTabela[categoria] = novaTabela[categoria] || {};
        novaTabela[categoria][posicao] = valor;
    });

    const sucesso = await setDocument('meta', 'tabela_pontuacao', novaTabela);

    if (sucesso) {
        tabelaPontuacaoCache = await getTabelaPontuacao();
        recalcular();
        msg.style.color = 'var(--color-success)';
        msg.innerText = 'Salvo! Já vale no Ranking, Painel de TV e imagens do totem.';
    } else {
        msg.style.color = 'var(--color-danger)';
        msg.innerText = 'Erro ao salvar. Verifique sua permissão.';
    }

    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => { msg.innerText = ''; }, 4000);
}

function renderResumo(ranking) {
    const el = document.getElementById('pontuacao-resumo');
    el.innerHTML = ranking.map(([equipe, pontos]) => `
        <div class="card" style="padding: 0.9rem 1.3rem; display:flex; align-items:center; gap:0.6rem;">
            ${chipEquipe(equipe)}
            <strong style="font-size:1.1rem;">${pontos}</strong>
            <span style="color:var(--color-text-muted); font-size:0.85rem;">pts</span>
        </div>
    `).join('');
}

function preencherFiltroCategoria() {
    const select = document.getElementById('filtro-categoria-pont');
    const valorAtual = select.value;
    select.innerHTML = '<option value="">Todas as categorias</option>';
    const categorias = [...new Set(extratoCache.map(l => l.categoriaLabel).filter(Boolean))].sort();
    categorias.forEach(c => select.add(new Option(c, c)));
    select.value = valorAtual;
}

function renderTabela() {
    const tbody = document.getElementById('pontuacao-lista');
    const valCategoria = document.getElementById('filtro-categoria-pont').value;
    const soProblemas = document.getElementById('filtro-so-problemas').checked;

    const linhas = extratoCache.filter(l => {
        if (valCategoria && l.categoriaLabel !== valCategoria) return false;
        if (soProblemas && !l.aviso) return false;
        return true;
    });

    if (linhas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--color-text-muted);">Nada encontrado para esse filtro.</td></tr>';
        return;
    }

    const opcoesCategoria = Object.entries(CATEGORIAS_PONTUACAO)
        .map(([chave, label]) => `<option value="${chave}">${label}</option>`).join('');

    tbody.innerHTML = linhas.map(l => {
        const semPontuar = !!l.aviso;
        const colocacoesHTML = l.colocacoes.length > 0
            ? l.colocacoes.map(c => `
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">
                    <strong style="min-width:2em;">${c.posicao ? c.posicao + 'º' : '+'}</strong>
                    ${chipEquipe(c.equipe)}
                    <span style="color:var(--color-primary-600); font-weight:700; margin-left:auto;">${c.pontos > 0 ? '+' : ''}${c.pontos}pt${c.obs ? ` <span style="color:var(--color-text-muted); font-weight:400; font-size:0.8rem;">(${c.obs})</span>` : ''}</span>
                </div>
            `).join('')
            : `<span style="color:var(--color-danger); font-size:0.9rem;">${l.aviso}</span>`;

        return `
            <tr style="${semPontuar ? 'background: rgba(239,68,68,0.05);' : ''}">
                <td>${l.modalidade}</td>
                <td style="color:var(--color-text-muted); font-size:0.9rem;">${l.fase}</td>
                <td>
                    <select class="form-control select-categoria-jogo" data-id="${l.id}" style="padding:0.35rem; border-radius:6px; border:1px solid var(--color-border); font-size:0.85rem;">
                        <option value="">Sem categoria</option>
                        ${opcoesCategoria}
                    </select>
                </td>
                <td style="min-width:220px;">${colocacoesHTML}</td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.select-categoria-jogo').forEach(select => {
        const linha = extratoCache.find(l => l.id === select.dataset.id);
        select.value = linha?.categoria || '';
        select.addEventListener('change', () => alterarCategoriaJogo(select.dataset.id, select.value));
    });
}

async function alterarCategoriaJogo(jogoId, novaCategoria) {
    const ok = await updateDocument('jogos', jogoId, { categoria: novaCategoria || null });
    if (!ok) {
        alert('Erro ao salvar a categoria. Tente novamente.');
        return;
    }
    const jogo = jogosCache.find(j => j.id === jogoId);
    if (jogo) jogo.categoria = novaCategoria || null;
    recalcular();
}
