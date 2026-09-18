// public/js/pages/admin/tv_imagens.js
// Imagens estáticas (PNG) do painel de TV pro totem de LED que NÃO tem
// entrada HDMI nem navegador — só toca um cartão/USB de imagens. Renderiza
// o mesmo HTML/CSS do painel ao vivo (tv.css + tv_render.js) dentro de um
// <iframe> isolado no tamanho exato do totem, e "fotografa" cada página com
// html2canvas. Alguém baixa os PNGs aqui e carrega no cartão do totem.
import { getCollection, getDocument, sortByDateAndTime } from '../../services/db.js?v=20260917b';
import { calcularRanking } from '../../pages/ranking.js?v=20260917b';
import {
    formatarDataBR, chunk, paginarPorAltura,
    criarLinhaJogoTabela, renderTabelaJogos, renderJogosVazio,
    criarLinhaPlacarTabela, renderTabelaPlacares, renderPlacaresVazio,
    renderTabelaMedalhas, renderMedalhasVazio
} from '../../services/tv_render.js?v=20260917b';

const RESOLUCAO = { largura: 278, altura: 556 }; // totem de LED (60cm x 2m) — ver tv.css
const ITENS_POR_PAGINA_MEDALHAS = 10; // lista curta (uma por equipe), fixo é suficiente

export function renderTvImagensAdminPage() {
    setTimeout(carregarPagina, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Imagens do Totem de LED</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 640px;">
                O totem físico não tem entrada HDMI nem navegador — só reproduz imagens de um
                cartão/USB. Esta página gera PNGs prontos, no tamanho exato da tela
                (${RESOLUCAO.largura} × ${RESOLUCAO.altura}px), com os jogos e placares de hoje e
                o quadro de medalhas geral. Baixe e carregue no cartão do totem.
            </p>

            <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                <button id="btn-gerar-imagens" class="btn btn-primary"><i data-lucide="image-plus"></i> Gerar imagens de hoje</button>
                <span id="tv-imagens-status" style="font-size: 0.85rem; color: var(--color-text-muted);"></span>
            </div>

            <div id="tv-imagens-resultado"></div>
        </div>
    `;
}

async function garantirHtml2Canvas() {
    if (window.html2canvas) return;
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Falha ao carregar html2canvas'));
        document.head.appendChild(script);
    });
}

function abrirIframeRender() {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.width = RESOLUCAO.largura;
        iframe.height = RESOLUCAO.altura;
        iframe.style.cssText = `position:fixed; left:-9999px; top:0; width:${RESOLUCAO.largura}px; height:${RESOLUCAO.altura}px; border:0;`;
        iframe.src = '/tv-render.html';
        iframe.onload = () => resolve(iframe);
        iframe.onerror = () => reject(new Error('Falha ao abrir tv-render.html'));
        document.body.appendChild(iframe);
    });
}

// Espera ícones do lucide + fontes/imagens pintarem antes de "fotografar"
// — sem isso o html2canvas às vezes captura ícone vazio. setTimeout (não
// requestAnimationFrame): rAF fica pausado indefinidamente se a aba não
// tiver foco real (ex: gerando em segundo plano), e travava aqui pra sempre.
function esperarPintura() {
    return new Promise(resolve => setTimeout(resolve, 50));
}

async function capturarPagina(doc, htmlPagina) {
    const stage = doc.getElementById('tv-stage');
    // Precisa do MESMO wrapper que tv.js usa (irParaSlide) — .tv-stage é flex
    // sem flex-direction (row), então sem essa section o título e o grid
    // ficam lado a lado em vez de empilhados.
    stage.innerHTML = `<section class="tv-slide" style="opacity:1; transform:none; animation:none;">${htmlPagina}</section>`;
    if (doc.defaultView.lucide) doc.defaultView.lucide.createIcons();
    await esperarPintura();

    const canvas = await window.html2canvas(doc.body, {
        width: RESOLUCAO.largura,
        height: RESOLUCAO.altura,
        scale: 1,
        backgroundColor: null,
        useCORS: true
    });
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function carregarPagina() {
    const btn = document.getElementById('btn-gerar-imagens');
    if (!btn) return;
    btn.addEventListener('click', gerarImagens);
    await gerarImagens();
}

async function gerarImagens() {
    const btn = document.getElementById('btn-gerar-imagens');
    const status = document.getElementById('tv-imagens-status');
    const resultado = document.getElementById('tv-imagens-resultado');
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Gerando...';
    if (window.lucide) window.lucide.createIcons();

    let iframe;
    try {
        status.textContent = 'Carregando ferramenta de captura...';
        await garantirHtml2Canvas();

        status.textContent = 'Carregando jogos de hoje...';
        const [jogosBrutos, equipes, config] = await Promise.all([
            getCollection('jogos', { force: true }),
            getCollection('equipes'),
            getDocument('meta', 'tv_config')
        ]);

        const jogos = jogosBrutos.filter(j =>
            j.modalidade_texto && j.modalidade_texto.toUpperCase() !== 'MODALIDADE' &&
            j.data_jogo && j.data_jogo.toUpperCase() !== 'DATA' && j.data_jogo.trim() !== ''
        );
        const hojeFmt = formatarDataBR();
        const jogosHojeTodos = jogos.filter(j => (j.data_jogo || '').toLowerCase().trim() === hojeFmt);
        sortByDateAndTime(jogosHojeTodos);
        const placaresHoje = jogosHojeTodos.filter(j => j.status === 'encerrado');
        // Jogo encerrado já apareceu nos placares — não repete na tabela de jogos.
        const jogosHoje = jogosHojeTodos.filter(j => j.status !== 'encerrado');
        const escala = (config && config.escala) || 1;

        status.textContent = 'Renderizando páginas...';
        iframe = await abrirIframeRender();
        const doc = iframe.contentDocument;
        doc.body.classList.add('tv--totem');
        doc.documentElement.style.setProperty('--tv-escala', escala);
        await esperarPintura();
        const stageEl = doc.getElementById('tv-stage');

        const imagens = [];

        const tituloAmostraJogos = `<h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje<span class="tv-slide-subtitle">${hojeFmt} · página 1/1</span></h2>`;
        const paginasJogos = paginarPorAltura(jogosHoje, criarLinhaJogoTabela, 'tv-table-jogos', tituloAmostraJogos, stageEl);
        if (paginasJogos.length === 0) {
            const blob = await capturarPagina(doc, renderJogosVazio(hojeFmt));
            imagens.push({ label: 'Jogos de hoje — nenhum jogo', arquivo: 'totem-jogos.png', blob });
        } else {
            for (let i = 0; i < paginasJogos.length; i++) {
                const html = renderTabelaJogos(paginasJogos[i], i + 1, paginasJogos.length, hojeFmt);
                const blob = await capturarPagina(doc, html);
                imagens.push({ label: `Jogos — página ${i + 1}/${paginasJogos.length}`, arquivo: `totem-jogos-${i + 1}-de-${paginasJogos.length}.png`, blob });
            }
        }

        const tituloAmostraPlacares = `<h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje<span class="tv-slide-subtitle">página 1/1</span></h2>`;
        const paginasPlacares = paginarPorAltura(placaresHoje, criarLinhaPlacarTabela, 'tv-table-placares', tituloAmostraPlacares, stageEl);
        if (paginasPlacares.length === 0) {
            const blob = await capturarPagina(doc, renderPlacaresVazio());
            imagens.push({ label: 'Placares de hoje — nenhum resultado', arquivo: 'totem-placares.png', blob });
        } else {
            for (let i = 0; i < paginasPlacares.length; i++) {
                const html = renderTabelaPlacares(paginasPlacares[i], i + 1, paginasPlacares.length);
                const blob = await capturarPagina(doc, html);
                imagens.push({ label: `Placares — página ${i + 1}/${paginasPlacares.length}`, arquivo: `totem-placares-${i + 1}-de-${paginasPlacares.length}.png`, blob });
            }
        }

        // Quadro de medalhas é geral (todos os jogos já encerrados, não só
        // hoje) — mesmo critério do painel ao vivo (tv.js). Lista curta (uma
        // linha por equipe), fixo em 10 basta sem precisar medir altura.
        const { ranking, medalhasPorEquipe } = calcularRanking(jogos, equipes);
        const itensMedalhas = ranking.map(([equipe, pontos], i) => ({ equipe, pontos, medalhas: medalhasPorEquipe[equipe], posicao: i + 1 }));
        const paginasMedalhas = chunk(itensMedalhas, ITENS_POR_PAGINA_MEDALHAS);
        if (paginasMedalhas.length === 0) {
            const blob = await capturarPagina(doc, renderMedalhasVazio());
            imagens.push({ label: 'Quadro de medalhas — pontuação em breve', arquivo: 'totem-medalhas.png', blob });
        } else {
            for (let i = 0; i < paginasMedalhas.length; i++) {
                const html = renderTabelaMedalhas(paginasMedalhas[i], i + 1, paginasMedalhas.length);
                const blob = await capturarPagina(doc, html);
                imagens.push({ label: `Medalhas — página ${i + 1}/${paginasMedalhas.length}`, arquivo: `totem-medalhas-${i + 1}-de-${paginasMedalhas.length}.png`, blob });
            }
        }

        renderResultado(resultado, imagens, hojeFmt);
        status.textContent = `${imagens.length} ${imagens.length === 1 ? 'imagem gerada' : 'imagens geradas'} — ${hojeFmt}.`;
    } catch (err) {
        console.error('Erro ao gerar imagens do totem:', err);
        status.textContent = '';
        resultado.innerHTML = `<div class="card" style="padding:1.5rem; color:var(--color-danger);">Erro ao gerar imagens: ${err.message || err}. Tente novamente.</div>`;
    } finally {
        if (iframe) iframe.remove();
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
        if (window.lucide) window.lucide.createIcons();
    }
}

function renderResultado(container, imagens, hojeFmt) {
    if (imagens.length === 0) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `
        <div class="card">
            <div class="card-header">Imagens geradas — ${hojeFmt}</div>
            <div style="padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.25rem;">
                ${imagens.map((img, i) => {
                    const url = URL.createObjectURL(img.blob);
                    return `
                        <div style="text-align:center;">
                            <img src="${url}" alt="${img.label}" style="width:100%; max-width:180px; aspect-ratio:${RESOLUCAO.largura}/${RESOLUCAO.altura}; object-fit:contain; border:1px solid var(--color-border); border-radius:8px; background:#03100f;">
                            <div style="font-size:0.8rem; color:var(--color-text-muted); margin:0.5rem 0;">${img.label}</div>
                            <a href="${url}" download="${img.arquivo}" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem;"><i data-lucide="download"></i> Baixar PNG</a>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();
}
