import { buscarColaboradoresPorNome, buscarInscritosPorModalidade, normalizarBusca, getDocument } from '../services/db.js';

const CORES_EQUIPE = {
    "Equipe Azul": "var(--color-info)",
    "Equipe Vermelha": "var(--color-danger)",
    "Equipe Amarela": "var(--color-warning)",
    "Equipe Verde": "var(--color-success)",
    "Sem Equipe": "var(--color-text-muted)"
};

const MAX_RESULTADOS = 25;

const modalidadesValidas = (a) => (a.modalidades || [])
    .filter(m => m && !/^coluna\s*\d+$/i.test(m));

const badgeEquipe = (equipe) => {
    const cor = CORES_EQUIPE[equipe] || 'var(--color-border)';
    return `<span class="badge" style="background-color: ${cor}; color: white; padding: 0.3rem 0.7rem; font-size: 0.8rem; border-radius: 6px;">${equipe}</span>`;
};

export function renderMinhasInscricoesPage() {
    setTimeout(initPagina, 100);
    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem; max-width: 760px;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 2.2rem; color: var(--color-primary-800); margin-bottom: 0.5rem;">Inscrições</h2>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <button id="tab-nome" class="btn btn-primary" style="padding: 0.6rem 1.2rem;">Buscar meu nome</button>
                <button id="tab-modalidade" class="btn btn-outline" style="padding: 0.6rem 1.2rem;">Ver por modalidade</button>
            </div>

            <!-- MODO: NOME -->
            <div id="modo-nome">
                <p style="color: var(--color-text-muted); font-size: 1rem; text-align: center; margin-bottom: 1rem;">
                    Digite seu nome (começando pelo primeiro nome) para ver suas modalidades.
                </p>
                <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
                    <input type="text" id="busca-inscricao" autocomplete="off" placeholder="Ex: Maria Silva"
                        class="form-control"
                        style="width: 100%; padding: 0.9rem 1rem; font-size: 1.05rem; border-radius: 8px; border: 1px solid var(--color-border);">
                </div>
                <div id="resultado-nome">
                    <p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                        <i data-lucide="search" style="width: 32px; height: 32px; opacity: 0.5;"></i><br>
                        Comece a digitar seu nome acima.
                    </p>
                </div>
            </div>

            <!-- MODO: MODALIDADE -->
            <div id="modo-modalidade" hidden>
                <p style="color: var(--color-text-muted); font-size: 1rem; text-align: center; margin-bottom: 1rem;">
                    Escolha a modalidade (e a equipe, se quiser) para ver os inscritos.
                </p>
                <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <select id="filtro-modalidade" class="form-control" style="flex: 1; min-width: 200px; padding: 0.7rem; border-radius: 8px; border: 1px solid var(--color-border);">
                        <option value="">Carregando modalidades...</option>
                    </select>
                    <select id="filtro-equipe" class="form-control" style="padding: 0.7rem; border-radius: 8px; border: 1px solid var(--color-border);">
                        <option value="">Todas as equipes</option>
                        <option value="Equipe Azul">Equipe Azul</option>
                        <option value="Equipe Amarela">Equipe Amarela</option>
                        <option value="Equipe Verde">Equipe Verde</option>
                        <option value="Equipe Vermelha">Equipe Vermelha</option>
                    </select>
                </div>
                <div id="resultado-modalidade">
                    <p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
                        Selecione uma modalidade acima.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function initPagina() {
    const tabNome = document.getElementById('tab-nome');
    const tabMod = document.getElementById('tab-modalidade');
    const modoNome = document.getElementById('modo-nome');
    const modoMod = document.getElementById('modo-modalidade');
    if (!tabNome || !tabMod) return;

    const setModo = (modo) => {
        const nome = modo === 'nome';
        modoNome.hidden = !nome;
        modoMod.hidden = nome;
        tabNome.className = nome ? 'btn btn-primary' : 'btn btn-outline';
        tabMod.className = nome ? 'btn btn-outline' : 'btn btn-primary';
        tabNome.style.padding = tabMod.style.padding = '0.6rem 1.2rem';
        if (!nome) initModoModalidade();
    };
    tabNome.addEventListener('click', () => setModo('nome'));
    tabMod.addEventListener('click', () => setModo('modalidade'));

    initModoNome();
}

// ---------------- MODO NOME ----------------

function initModoNome() {
    const input = document.getElementById('busca-inscricao');
    const container = document.getElementById('resultado-nome');
    if (!input || input.dataset.ready) return;
    input.dataset.ready = '1';

    const cardAtleta = (a) => {
        const equipe = a.equipe || 'Sem Equipe';
        const mods = modalidadesValidas(a);
        const chips = mods.length
            ? mods.map(m => `<span style="display: inline-block; background: rgba(28, 199, 190, 0.15); color: var(--color-primary-500); border: 1px solid var(--color-border); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.9rem; margin: 0.2rem; font-weight: 500;">${m}</span>`).join('')
            : `<span style="color: var(--color-text-muted); font-size: 0.9rem;">Nenhuma modalidade registrada.</span>`;
        return `
            <div class="card" style="padding: 1.25rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                    <span style="font-size: 1.15rem; font-weight: 600;">${a.nome || 'N/A'}</span>
                    ${badgeEquipe(equipe)}
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

    const cacheBusca = new Map();
    let ultimaBusca = 0;

    const buscar = async () => {
        const bruto = input.value.trim();
        const termo = normalizarBusca(bruto);
        if (termo.length < 3) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">Digite pelo menos 3 letras do seu nome.</p>`;
            return;
        }
        const palavras = termo.split(' ').filter(Boolean);
        const prefixo = palavras[0];

        container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i></p>`;
        if (window.lucide) window.lucide.createIcons();

        const marca = ++ultimaBusca;
        let base = cacheBusca.get(prefixo);
        if (!base) {
            base = await buscarColaboradoresPorNome(prefixo, 60);
            cacheBusca.set(prefixo, base);
        }
        if (marca !== ultimaBusca) return;

        const achados = base
            .filter(a => palavras.every(p => normalizarBusca(a.nome).includes(p)))
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
            html += `<p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem; padding: 0.5rem 0;">Mostrando ${MAX_RESULTADOS} de ${achados.length}. Digite o sobrenome pra refinar.</p>`;
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

// ---------------- MODO MODALIDADE ----------------

let modalidadeInit = false;

async function initModoModalidade() {
    if (modalidadeInit) return;
    modalidadeInit = true;

    const selMod = document.getElementById('filtro-modalidade');
    const selEq = document.getElementById('filtro-equipe');
    const container = document.getElementById('resultado-modalidade');

    let lista = [];
    try {
        const meta = await getDocument('meta', 'modalidades_inscricao');
        lista = (meta && meta.lista) || [];
    } catch (e) {
        console.error(e);
    }

    if (lista.length === 0) {
        selMod.innerHTML = '<option value="">Nenhuma modalidade disponível</option>';
        return;
    }
    selMod.innerHTML = '<option value="">Selecione a modalidade...</option>' +
        lista.map(m => `<option value="${m}">${m}</option>`).join('');

    const cacheMod = new Map();
    let ultima = 0;

    const render = async () => {
        const mod = selMod.value;
        const eq = selEq.value;
        if (!mod) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">Selecione uma modalidade acima.</p>`;
            return;
        }

        container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">
            <i data-lucide="loader-2" class="spin" style="width: 24px; height: 24px;"></i></p>`;
        if (window.lucide) window.lucide.createIcons();

        const marca = ++ultima;
        let base = cacheMod.get(mod);
        if (!base) {
            base = await buscarInscritosPorModalidade(mod, 300);
            cacheMod.set(mod, base);
        }
        if (marca !== ultima) return;

        const filtrados = base
            .filter(a => !eq || (a.equipe || 'Sem Equipe') === eq)
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

        if (filtrados.length === 0) {
            container.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 2rem 0;">Nenhum inscrito ${eq ? `da ${eq} ` : ''}nessa modalidade.</p>`;
            return;
        }

        const linhas = filtrados.map(a => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 0; border-bottom: 1px solid var(--color-border);">
                <span style="font-weight: 500;">${a.nome || 'N/A'}</span>
                ${badgeEquipe(a.equipe || 'Sem Equipe')}
            </div>
        `).join('');

        container.innerHTML = `
            <div class="card" style="padding: 1rem 1.25rem;">
                <div style="font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); margin-bottom: 0.5rem;">
                    ${filtrados.length} inscrito${filtrados.length === 1 ? '' : 's'}
                </div>
                ${linhas}
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    };

    selMod.addEventListener('change', render);
    selEq.addEventListener('change', render);
}
