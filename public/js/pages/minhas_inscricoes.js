import { getCollection } from '../services/db.js';

const CORES_EQUIPE = {
    "Equipe Azul": "var(--color-info)",
    "Equipe Vermelha": "var(--color-danger)",
    "Equipe Amarela": "var(--color-warning)",
    "Equipe Verde": "var(--color-success)",
    "Sem Equipe": "var(--color-text-muted)"
};

const MAX_RESULTADOS = 25;

export function renderMinhasInscricoesPage() {
    setTimeout(initMinhasInscricoes, 100);
    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem; max-width: 720px;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <h2 style="font-size: 2.2rem; color: var(--color-primary-800); margin-bottom: 0.5rem;">Minhas Inscrições</h2>
                <p style="color: var(--color-text-muted); font-size: 1.05rem;">
                    Digite seu nome para ver em quais modalidades você está inscrito.
                </p>
            </div>

            <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
                <input type="text" id="busca-inscricao" autocomplete="off"
                    placeholder="Digite seu nome..."
                    class="form-control"
                    style="width: 100%; padding: 0.9rem 1rem; font-size: 1.05rem; border-radius: 8px; border: 1px solid var(--color-border);">
            </div>

            <div id="resultado-inscricoes">
                <p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                    <i data-lucide="search" style="width: 32px; height: 32px; opacity: 0.5;"></i><br>
                    Comece a digitar seu nome acima.
                </p>
            </div>
        </div>
    `;
}

async function initMinhasInscricoes() {
    const input = document.getElementById('busca-inscricao');
    const container = document.getElementById('resultado-inscricoes');
    if (!input || !container) return;

    container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
        <i data-lucide="loader-2" class="spin" style="width: 28px; height: 28px;"></i><br>Carregando base de inscritos...</p>`;
    if (window.lucide) window.lucide.createIcons();

    let atletas = [];
    try {
        atletas = await getCollection('colaboradores');
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p style="text-align: center; color: var(--color-danger); padding: 2rem 0;">Erro ao carregar a base de inscritos. Tente novamente.</p>`;
        return;
    }

    const estadoInicial = () => {
        container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            <i data-lucide="search" style="width: 32px; height: 32px; opacity: 0.5;"></i><br>
            Comece a digitar seu nome acima.</p>`;
        if (window.lucide) window.lucide.createIcons();
    };
    estadoInicial();

    const normalizar = (s) => (s || '').toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const modalidadesValidas = (a) => (a.modalidades || [])
        .filter(m => m && !/^coluna\s*\d+$/i.test(m));

    const cardAtleta = (a) => {
        const equipe = a.equipe || 'Sem Equipe';
        const cor = CORES_EQUIPE[equipe] || 'var(--color-border)';
        const mods = modalidadesValidas(a);
        const chips = mods.length
            ? mods.map(m => `<span style="display: inline-block; background: rgba(28, 199, 190, 0.15); color: var(--color-primary-500); border: 1px solid var(--color-border); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.9rem; margin: 0.2rem; font-weight: 500;">${m}</span>`).join('')
            : `<span style="color: var(--color-text-muted); font-size: 0.9rem;">Nenhuma modalidade registrada.</span>`;

        return `
            <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                    <span style="font-size: 1.15rem; font-weight: 600;">${a.nome || 'N/A'}</span>
                    <span class="badge" style="background-color: ${cor}; color: white; padding: 0.3rem 0.7rem; font-size: 0.8rem; border-radius: 6px;">${equipe}</span>
                </div>
                <div style="color: var(--color-text-muted); font-size: 0.85rem; margin-bottom: 0.75rem;">
                    ${a.vinculo ? a.vinculo : ''}${a.matricula ? ` &middot; Matrícula ${a.matricula}` : ''}
                </div>
                <div style="border-top: 1px solid var(--color-border); padding-top: 0.75rem;">
                    <div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                        Modalidades inscritas (${mods.length})
                    </div>
                    <div style="margin: -0.2rem;">${chips}</div>
                </div>
            </div>
        `;
    };

    const buscar = () => {
        const termo = normalizar(input.value).trim();
        if (termo.length < 2) {
            estadoInicial();
            return;
        }

        // Cada palavra digitada precisa aparecer no nome (não importa a ordem)
        const palavras = termo.split(/\s+/).filter(Boolean);
        const achados = atletas
            .filter(a => {
                const nome = normalizar(a.nome);
                return palavras.every(p => nome.includes(p));
            })
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

        if (achados.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                Nenhuma inscrição encontrada para <strong>"${input.value.trim()}"</strong>.<br>
                <span style="font-size: 0.9rem;">Confira a grafia ou procure a organização.</span></p>`;
            return;
        }

        const mostrar = achados.slice(0, MAX_RESULTADOS);
        let html = mostrar.map(cardAtleta).join('');
        if (achados.length > MAX_RESULTADOS) {
            html += `<p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem; padding: 0.5rem 0;">
                Mostrando ${MAX_RESULTADOS} de ${achados.length} resultados. Digite o nome completo para refinar.</p>`;
        }
        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    };

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(buscar, 150);
    });
    input.focus();
}
