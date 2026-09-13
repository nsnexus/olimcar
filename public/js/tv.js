// public/js/tv.js — Painel de TV (loop de jogos, placares, medalhas e vídeos)
import { getCollection, sortByDateAndTime } from './services/db.js?v=20260912c';
import { calcularRanking } from './pages/ranking.js?v=20260912c';

// ---------- CONFIGURAÇÃO ----------

// Vídeos institucionais/produzidos para o loop. Cadastrados pelo admin em
// /admin/tv-videos (Storage + coleção 'tv_videos'), lidos aqui a cada
// atualização de dados — não precisa editar código pra trocar vídeo.

const DURACAO_JOGOS_MS = 9000;
const DURACAO_PLACARES_MS = 9000;
const DURACAO_MEDALHAS_MS = 15000;
const DURACAO_VAZIO_MS = 10000;
const DURACAO_VIDEO_FALLBACK_MS = 45000; // caso o vídeo não dispare 'ended'
const ITENS_POR_PAGINA = 8;
const REFRESH_DADOS_MS = 3 * 60 * 1000; // reconsulta o Firestore a cada 3 min

const CORES_EQUIPE = {
    "Equipe Azul": "#2f6fed",
    "Equipe Vermelha": "#e5484d",
    "Equipe Amarela": "#ECB11F",
    "Equipe Verde": "#1CC7BE"
};

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

// ---------- HELPERS DE DATA/HORA ----------

function formatarHojeBR(d = new Date()) {
    return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function corEquipe(nome) {
    return CORES_EQUIPE[nome] || 'rgba(234,250,248,0.4)';
}

function nomeCurto(nome) {
    return (nome || 'A Definir').replace(/^Equipe\s+/i, '');
}

function chunk(arr, size) {
    if (arr.length === 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
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

// ---------- RENDER: JOGOS DO DIA ----------

function renderJogos(pagina, indicePagina, totalPaginas, hojeFmt) {
    const cards = pagina.map((j, i) => {
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
    }).join('');

    return `
        <h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje
            <span class="tv-slide-subtitle">${hojeFmt}${totalPaginas > 1 ? ` · página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-games-grid">${cards}</div>
    `;
}

function renderJogosVazio(hojeFmt) {
    return `
        <h2 class="tv-slide-title"><i data-lucide="calendar-days"></i> Jogos de Hoje
            <span class="tv-slide-subtitle">${hojeFmt}</span>
        </h2>
        <div class="tv-empty">
            <i data-lucide="calendar-x"></i>
            <div class="tv-empty-title">Nenhum jogo agendado para hoje</div>
            <div class="tv-empty-text">Confira a agenda completa no site oficial da Olimcar.</div>
        </div>
    `;
}

// ---------- RENDER: PLACARES DO DIA ----------

function renderPlacares(pagina, indicePagina, totalPaginas) {
    const cards = pagina.map((j, i) => {
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
    }).join('');

    return `
        <h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje
            <span class="tv-slide-subtitle">${totalPaginas > 1 ? `página ${indicePagina}/${totalPaginas}` : ''}</span>
        </h2>
        <div class="tv-scores-grid">${cards}</div>
    `;
}

function renderPlacaresVazio() {
    return `
        <h2 class="tv-slide-title"><i data-lucide="trophy"></i> Placares de Hoje</h2>
        <div class="tv-empty">
            <i data-lucide="hourglass"></i>
            <div class="tv-empty-title">Nenhum resultado registrado ainda</div>
            <div class="tv-empty-text">Assim que os jogos de hoje forem encerrados, os placares aparecem aqui.</div>
        </div>
    `;
}

// ---------- RENDER: MEDALHAS ----------

function renderMedalhas(jogos, equipes) {
    const { ranking, medalhasPorEquipe } = calcularRanking(jogos, equipes);

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

// ---------- MONTAGEM DA ROTAÇÃO ----------

async function montarRotacao() {
    const [jogosBrutos, equipes, videosCadastrados] = await Promise.all([
        getCollection('jogos'),
        getCollection('equipes'),
        getCollection('tv_videos')
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

    const paginasJogos = chunk(jogosHoje, ITENS_POR_PAGINA);
    if (paginasJogos.length === 0) {
        slides.push({ tipo: 'jogos', html: renderJogosVazio(hojeFmt), duracao: DURACAO_VAZIO_MS });
    } else {
        paginasJogos.forEach((pag, i) => {
            slides.push({ tipo: 'jogos', html: renderJogos(pag, i + 1, paginasJogos.length, hojeFmt), duracao: DURACAO_JOGOS_MS });
        });
    }

    const paginasPlacares = chunk(placaresHoje, ITENS_POR_PAGINA);
    if (paginasPlacares.length === 0) {
        slides.push({ tipo: 'placares', html: renderPlacaresVazio(), duracao: DURACAO_VAZIO_MS });
    } else {
        paginasPlacares.forEach((pag, i) => {
            slides.push({ tipo: 'placares', html: renderPlacares(pag, i + 1, paginasPlacares.length), duracao: DURACAO_PLACARES_MS });
        });
    }

    slides.push({ tipo: 'medalhas', html: renderMedalhas(jogos, equipes), duracao: DURACAO_MEDALHAS_MS });

    if (VIDEOS.length === 0) {
        slides.push({ tipo: 'video', html: renderMarcaOlimcar(), duracao: DURACAO_VAZIO_MS });
    } else {
        VIDEOS.forEach(src => slides.push({ tipo: 'video-arquivo', html: '', duracao: null, videoSrc: src }));
    }

    return { slides, hojeFmt };
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
            const duracao = rotacao.slides[i].duracao || DURACAO_VIDEO_FALLBACK_MS;
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
            timerAtual = setTimeout(proximoSlide, DURACAO_VIDEO_FALLBACK_MS);
        } else {
            overlay.hidden = true;
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

// ---------- INÍCIO ----------

async function iniciar() {
    iniciarRelogio();
    criarFolhas();

    rotacao = await montarRotacao();
    verificarVirada(rotacao.hojeFmt);
    renderDots();
    irParaSlide(0);

    setInterval(async () => {
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
