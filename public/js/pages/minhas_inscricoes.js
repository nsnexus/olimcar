import { buscarColaboradoresPorNome, normalizarBusca } from '../services/db.js';

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
                    Digite seu nome (começando pelo primeiro nome) para ver em quais modalidades você está inscrito.
                </p>
            </div>

            <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
                <input type="text" id="busca-inscricao" autocomplete="off"
                    placeholder="Ex: Maria Silva"
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

function initMinhasInscricoes() {
    const input = document.getElementById('busca-inscricao');
    const container = document.getElementById('resultado-inscricoes');
    if (!input || !container) return;

    const estadoInicial = () => {
        container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            <i data-lucide="search" style="width: 32px; height: 32px; opacity: 0.5;"></i><br>
            Comece a digitar seu nome acima.</p>`;
        if (window.lucide) window.lucide.createIcons();
    };
    estadoInicial();

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

    // cache local dos resultados já buscados (por prefixo), evita refazer query
    const cacheBusca = new Map();
    let ultimaBusca = 0;

    const buscar = async () => {
        const bruto = input.value.trim();
        const termo = normalizarBusca(bruto);

        if (termo.length < 3) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                Digite pelo menos 3 letras do seu nome.</p>`;
            return;
        }

        const palavras = termo.split(' ').filter(Boolean);
        const prefixo = palavras[0]; // query no servidor só pelo 1º nome

        container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i></p>`;
        if (window.lucide) window.lucide.createIcons();

        const marca = ++ultimaBusca;
        let base = cacheBusca.get(prefixo);
        if (!base) {
            base = await buscarColaboradoresPorNome(prefixo, 60);
            cacheBusca.set(prefixo, base);
        }
        if (marca !== ultimaBusca) return; // chegou resposta de uma busca antiga

        // refina no cliente: todas as palavras digitadas precisam estar no nome
        const achados = base
            .filter(a => {
                const nome = normalizarBusca(a.nome);
                return palavras.every(p => nome.includes(p));
            })
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

        if (achados.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                Nenhuma inscrição encontrada para <strong>"${bruto}"</strong>.<br>
                <span style="font-size: 0.9rem;">Comece pelo primeiro nome e confira a grafia, ou procure a organização.</span></p>`;
            return;
        }

        const mostrar = achados.slice(0, MAX_RESULTADOS);
        let html = mostrar.map(cardAtleta).join('');
        if (achados.length > MAX_RESULTADOS) {
            html += `<p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem; padding: 0.5rem 0;">
                Mostrando ${MAX_RESULTADOS} de ${achados.length}. Digite o sobrenome pra refinar.</p>`;
        }
        container.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    };

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(buscar, 350);
    });
    input.focus();
}
