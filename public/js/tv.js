// public/js/tv.js — Painel de TV (loop de jogos, placares, medalhas e vídeos)
import { getCollection, getDocument, getTabelaPontuacao, sortByDateAndTime } from './services/db.js?v=20260917b';
import { calcularRanking } from './pages/ranking.js?v=20260917b';
import {
    formatarDataBR, paginarPorAltura, corEquipe, nomeCurto,
    criarCardJogo, renderJogos, renderJogosVazio,
    criarCardPlacar, renderPlacares, renderPlacaresVazio
} from './services/tv_render.js?v=20260917b';

// ---------- CONFIGURAÇÃO ----------

// Vídeos institucionais/produzidos para o loop. Cadastrados pelo admin em
// /admin/tv-videos (Storage + coleção 'tv_videos'), lidos aqui a cada
// atualização de dados — não precisa editar código pra trocar vídeo.

const DURACAO_JOGOS_MS = 9000;
const DURACAO_PLACARES_MS = 9000;
const DURACAO_MEDALHAS_MS = 15000;
const DURACAO_VAZIO_MS = 10000;
const DURACAO_VIDEO_FALLBACK_MS = 10 * 60 * 1000; // rede de segurança genérica (ajustada pra duração real assim que ela é lida)
const REFRESH_DADOS_MS = 3 * 60 * 1000; // reconsulta o Firestore a cada 3 min

// formatarHojeBR() = mesmo texto que fica salvo em jogos.data_jogo, usado
// pra filtrar "os jogos de hoje" — mantém o nome local pra não reescrever
// todo o resto do arquivo, só delega pro helper compartilhado.
function formatarHojeBR(d = new Date()) {
    return formatarDataBR(d);
}

// ---------- RELÓGIO ----------

function iniciarRelogio() {
    const elTime = document.getElementById('tv-time');
    const elDate = document.getElementById('tv-date');
    const tick = () => {
        const agora = new Date();
        elTime.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dataFmt = formatarHojeBR(agora);
        elDate.textContent = dataFmt.charAt(0).toUpperCase() + dataFmt.slice(1);
    };
    tick();
    setInterval(tick, 1000);
}

// ---------- FOLHAS DE FUNDO ----------

function criarFolhas() {
    const container = document.getElementById('tv-leaves');
    const glyphs = ['🍃', '🍂', '🌿'];
    for (let i = 0; i < 12; i++) {
        const leaf = document.createElement('span');
        leaf.className = 'tv-leaf';
        leaf.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        leaf.style.left = Math.random() * 100 + '%';
        leaf.style.fontSize = (18 + Math.random() * 14) + 'px';
        const dur = 12 + Math.random() * 10;
        leaf.style.animationDuration = dur + 's';
        leaf.style.animationDelay = (-Math.random() * dur) + 's';
        container.appendChild(leaf);
    }
}

// ---------- RENDER: MEDALHAS ----------

function renderMedalhas(jogos, equipes, tabelaPontuacao) {
    const { ranking, medalhasPorEquipe } = calcularRanking(jogos, equipes, tabelaPontuacao);

    if (ranking.length === 0) {
        return `
            <h2 class="tv-slide-title"><i data-lucide="medal"></i> Quadro de Medalhas</h2>
            <div class="tv-empty">
                <i data-lucide="medal"></i>
                <div class="tv-empty-title">Pontuação em breve</div>
                <div class="tv-empty-text">O quadro é atualizado conforme os jogos vão sendo encerrados.</div>
            </div>
        `;
    }

    const maxPontos = Math.max(1, ranking[0][1]);
    const cards = ranking.map(([equipe, pontos], i) => {
        const position = i + 1;
        const medalhas = medalhasPorEquipe[equipe];
        const largura = (pontos / maxPontos) * 100;
        const cor = corEquipe(equipe);
        return `
            <div class="tv-medal-card rank-${position}" style="animation-delay:${i * 0.1}s">
                <div class="tv-medal-rank">${position}º</div>
                <div class="tv-medal-team">
                    <span class="tv-medal-dot" style="background:${cor}"></span>
                    <span class="tv-medal-name">${nomeCurto(equipe)}</span>
                </div>
                <div class="tv-medal-bar-bg"><div class="tv-medal-bar-fill" style="width:${largura}%; background:${cor}"></div></div>
                <div class="tv-medal-badges">
                    <span class="tv-medal-badge gold"><i data-lucide="medal"></i>${medalhas[1]}</span>
                    <span class="tv-medal-badge silver"><i data-lucide="medal"></i>${medalhas[2]}</span>
                    <span class="tv-medal-badge bronze"><i data-lucide="medal"></i>${medalhas[3]}</span>
                    <span class="tv-medal-badge fourth">4º ${medalhas[4] || 0}</span>
                </div>
                <div class="tv-medal-points">${pontos} <span>pts</span></div>
            </div>
        `;
    }).join('');

    return `
        <h2 class="tv-slide-title"><i data-lucide="medal"></i> Quadro de Medalhas</h2>
        <div class="tv-medal-list">${cards}</div>
    `;
}

// ---------- RENDER: VÍDEO ----------
// O elemento de vídeo em tela cheia mora fora da árvore do .tv (ver tv.html)
// pra não herdar o transform de .tv-slide — só controlamos ele aqui.

function renderMarcaOlimcar() {
    return `
        <div class="tv-brand-placeholder">
            <img src="/assets/logo-transparent.png" alt="OLIMCAR">
            <div class="tv-brand-placeholder-text">Força · União · Superação</div>
        </div>
    `;
}

// Conteúdo das laterais enquanto um vídeo toca (a marca sozinha some no vazio):
// jogos de hoje de um lado, placares do outro — aproveita o espaço que o
// vídeo (geralmente 16:9) deixa sobrando fora do centro.
const MAX_ITENS_LATERAL_VIDEO = 6;

function renderLateralVideoFallback() {
    return `<img src="/assets/logo-transparent.png" alt="OLIMCAR">`;
}

function renderLateralVideoJogos(jogosHoje) {
    if (jogosHoje.length === 0) return renderLateralVideoFallback();
    const itens = jogosHoje.slice(0, MAX_ITENS_LATERAL_VIDEO).map(j => {
        const timeA = nomeCurto(j.equipe_a?.nome || 'A Definir');
        const timeB = nomeCurto(j.equipe_b?.nome || 'A Definir');
        return `<div class="tv-video-side-item">
            <span class="tv-video-side-hora">${j.horario || '--:--'}</span>
            <span class="tv-video-side-txt">${j.modalidade_texto || ''} — ${timeA} x ${timeB}</span>
        </div>`;
    }).join('');
    const resto = jogosHoje.length - MAX_ITENS_LATERAL_VIDEO;
    return `
        <div class="tv-video-side-list">
            <div class="tv-video-side-title"><i data-lucide="calendar-days"></i> Jogos de Hoje</div>
            ${itens}
            ${resto > 0 ? `<div class="tv-video-side-mais">+ ${resto} jogo${resto > 1 ? 's' : ''}</div>` : ''}
        </div>
    `;
}

function renderLateralVideoPlacares(placaresHoje) {
    if (placaresHoje.length === 0) return renderLateralVideoFallback();
    const itens = placaresHoje.slice(0, MAX_ITENS_LATERAL_VIDEO).map(j => {
        const timeA = nomeCurto(j.equipe_a?.nome || 'A Definir');
        const timeB = nomeCurto(j.equipe_b?.nome || 'A Definir');
        return `<div class="tv-video-side-item">
            <span class="tv-video-side-txt">${timeA} <strong>${j.placar_a ?? 0}</strong> × <strong>${j.placar_b ?? 0}</strong> ${timeB}</span>
        </div>`;
    }).join('');
    const resto = placaresHoje.length - MAX_ITENS_LATERAL_VIDEO;
    return `
        <div class="tv-video-side-list">
            <div class="tv-video-side-title"><i data-lucide="trophy"></i> Placares de Hoje</div>
            ${itens}
            ${resto > 0 ? `<div class="tv-video-side-mais">+ ${resto} resultado${resto > 1 ? 's' : ''}</div>` : ''}
        </div>
    `;
}

// ---------- MONTAGEM DA ROTAÇÃO ----------

async function montarRotacao() {
    const [jogosBrutos, equipes, videosCadastrados, tabelaPontuacao] = await Promise.all([
        getCollection('jogos'),
        getCollection('equipes'),
        getCollection('tv_videos'),
        getTabelaPontuacao()
    ]);
    const VIDEOS = videosCadastrados
        .slice()
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map(v => v.url)
        .filter(Boolean);

    const jogos = jogosBrutos.filter(j =>
        j.modalidade_texto && j.modalidade_texto.toUpperCase() !== 'MODALIDADE' &&
        j.data_jogo && j.data_jogo.toUpperCase() !== 'DATA' && j.data_jogo.trim() !== ''
    );
    sortByDateAndTime(jogos);

    const hojeFmt = formatarHojeBR();
    const jogosHoje = jogos.filter(j => (j.data_jogo || '').toLowerCase().trim() === hojeFmt);
    const placaresHoje = jogosHoje.filter(j => j.status === 'encerrado');

    const slides = [];
    const stageEl = document.getElementById('tv-stage');

    const tituloAmostraJogos = `<h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje<span class="tv-slide-subtitle">${hojeFmt} · página 1/1</span></h2>`;
    const paginasJogos = paginarPorAltura(jogosHoje, criarCardJogo, 'tv-games-grid', tituloAmostraJogos, stageEl);
    if (paginasJogos.length === 0) {
        slides.push({ tipo: 'jogos', html: renderJogosVazio(hojeFmt), duracao: DURACAO_VAZIO_MS });
    } else {
        paginasJogos.forEach((pag, i) => {
            slides.push({ tipo: 'jogos', html: renderJogos(pag, i + 1, paginasJogos.length, hojeFmt), duracao: DURACAO_JOGOS_MS });
        });
    }

    const tituloAmostraPlacares = `<h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje<span class="tv-slide-subtitle">página 1/1</span></h2>`;
    const paginasPlacares = paginarPorAltura(placaresHoje, criarCardPlacar, 'tv-scores-grid', tituloAmostraPlacares, stageEl);
    if (paginasPlacares.length === 0) {
        slides.push({ tipo: 'placares', html: renderPlacaresVazio(), duracao: DURACAO_VAZIO_MS });
    } else {
        paginasPlacares.forEach((pag, i) => {
            slides.push({ tipo: 'placares', html: renderPlacares(pag, i + 1, paginasPlacares.length), duracao: DURACAO_PLACARES_MS });
        });
    }

    slides.push({ tipo: 'medalhas', html: renderMedalhas(jogos, equipes, tabelaPontuacao), duracao: DURACAO_MEDALHAS_MS });

    const videoSideEsquerda = renderLateralVideoJogos(jogosHoje);
    const videoSideDireita = renderLateralVideoPlacares(placaresHoje);

    if (VIDEOS.length === 0) {
        slides.push({ tipo: 'video', html: renderMarcaOlimcar(), duracao: DURACAO_VAZIO_MS });
    } else {
        VIDEOS.forEach(src => slides.push({ tipo: 'video-arquivo', html: '', duracao: null, videoSrc: src }));
    }

    return { slides, hojeFmt, videoSideEsquerda, videoSideDireita };
}

// ---------- MOTOR DE ROTAÇÃO ----------

let rotacao = { slides: [], hojeFmt: '' };
let indiceAtual = 0;
let timerAtual = null;

function renderDots(stage) {
    const dotsEl = document.getElementById('tv-dots');
    dotsEl.innerHTML = rotacao.slides.map((_, i) => `<div class="tv-dot" data-i="${i}"><div class="tv-dot-fill"></div></div>`).join('');
}

function atualizarDots() {
    const dotsEl = document.getElementById('tv-dots');
    Array.from(dotsEl.children).forEach((dot, i) => {
        dot.classList.remove('active', 'done');
        const fill = dot.querySelector('.tv-dot-fill');
        fill.style.animation = 'none';
        if (i < indiceAtual) dot.classList.add('done');
        if (i === indiceAtual) {
            dot.classList.add('active');
            const duracao = rotacao.slides[i].duracaoReal || rotacao.slides[i].duracao || DURACAO_VIDEO_FALLBACK_MS;
            requestAnimationFrame(() => {
                fill.style.animation = `tvDotFill linear forwards`;
                fill.style.animationDuration = duracao + 'ms';
            });
        }
    });
}

function irParaSlide(i) {
    clearTimeout(timerAtual);
    if (rotacao.slides.length === 0) return;
    indiceAtual = ((i % rotacao.slides.length) + rotacao.slides.length) % rotacao.slides.length;

    const stage = document.getElementById('tv-stage');
    const atual = stage.querySelector('.tv-slide');
    const montarNovo = () => {
        stage.innerHTML = `<section class="tv-slide">${rotacao.slides[indiceAtual].html}</section>`;
        if (window.lucide) window.lucide.createIcons();
        atualizarDots();

        const slide = rotacao.slides[indiceAtual];
        const overlay = document.getElementById('tv-video-overlay');
        const videoEl = document.getElementById('tv-video-el');

        if (slide.tipo === 'video-arquivo') {
            overlay.hidden = false;
            const lados = overlay.querySelectorAll('.tv-video-side');
            if (lados[0]) lados[0].innerHTML = rotacao.videoSideEsquerda || '';
            if (lados[1]) lados[1].innerHTML = rotacao.videoSideDireita || '';
            if (window.lucide) window.lucide.createIcons();
            videoEl.muted = false;
            videoEl.src = slide.videoSrc;
            // .onended (não addEventListener) porque o <video> é reaproveitado entre
            // slides — assim cada troca substitui o handler em vez de empilhar.
            videoEl.onended = proximoSlide;
            // Tenta tocar com áudio (o clique em "Iniciar Painel" já liberou autoplay
            // com som pra essa aba). Se o navegador ainda assim bloquear, cai pra mudo
            // em vez de travar a tela preta.
            videoEl.play().catch(() => {
                videoEl.muted = true;
                videoEl.play().catch(() => {});
            });

            // Fallback genérico primeiro; assim que a duração real do vídeo
            // é conhecida, reajusta o timer pra ela (+3s de margem) — o
            // 'ended' deve disparar antes disso de qualquer forma.
            timerAtual = setTimeout(proximoSlide, DURACAO_VIDEO_FALLBACK_MS);
            videoEl.onloadedmetadata = () => {
                if (isFinite(videoEl.duration) && videoEl.duration > 0) {
                    clearTimeout(timerAtual);
                    slide.duracaoReal = videoEl.duration * 1000 + 3000;
                    atualizarDots();
                    timerAtual = setTimeout(proximoSlide, slide.duracaoReal);
                }
            };
        } else {
            overlay.hidden = true;
            videoEl.onloadedmetadata = null;
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.load();
            timerAtual = setTimeout(proximoSlide, slide.duracao);
        }
    };

    if (atual) {
        atual.classList.add('tv-slide-out');
        timerAtual = setTimeout(montarNovo, 380);
    } else {
        montarNovo();
    }
}

function proximoSlide() {
    irParaSlide(indiceAtual + 1);
}

async function recarregarDados() {
    try {
        const novaRotacao = await montarRotacao();
        rotacao = novaRotacao;
        renderDots();
        if (indiceAtual >= rotacao.slides.length) indiceAtual = 0;
    } catch (e) {
        console.error('Erro ao atualizar dados do painel de TV:', e);
    }
}

function verificarVirada(diaCarregado) {
    setInterval(() => {
        if (formatarHojeBR() !== diaCarregado) {
            location.reload();
        }
    }, 60000);
}

// ---------- CONFIGURAÇÃO DO FORMATO (definida em /admin/tv-videos) ----------

async function aplicarConfig() {
    let config = {};
    try {
        config = (await getDocument('meta', 'tv_config')) || {};
    } catch (e) {
        console.error('Erro ao ler meta/tv_config:', e);
    }
    document.body.classList.toggle('tv--faixa', config.formato === 'faixa');
    document.body.classList.toggle('tv--totem', config.formato === 'totem');
    document.documentElement.style.setProperty('--tv-escala', config.escala || 1);
}

// ---------- INÍCIO ----------

async function iniciar() {
    iniciarRelogio();
    criarFolhas();

    await aplicarConfig();
    rotacao = await montarRotacao();
    verificarVirada(rotacao.hojeFmt);
    renderDots();
    irParaSlide(0);

    setInterval(async () => {
        await aplicarConfig();
        const novaRotacao = await montarRotacao();
        rotacao = novaRotacao;
        renderDots();
        atualizarDots();
    }, REFRESH_DADOS_MS);
}

function ativarTelaCheia() {
    const overlay = document.getElementById('tv-start-overlay');
    const entrar = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        overlay.remove();
        iniciar();
    };
    overlay.addEventListener('click', entrar, { once: true });
    document.addEventListener('keydown', entrar, { once: true });
}

ativarTelaCheia();
