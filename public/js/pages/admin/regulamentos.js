// public/js/pages/admin/regulamentos.js
import { getCollection, addDocument, deleteDocument, uploadRegulamento, deleteArquivoStorage } from '../../services/db.js?v=20260912a';

export function renderRegulamentosAdminPage() {
    setTimeout(carregarPagina, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Regulamentos (PDF)</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.25rem;">Enviar novo PDF</h3>
                <form id="form-regulamento" style="display: flex; flex-direction: column; gap: 1.1rem; max-width: 520px;">
                    <div>
                        <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--color-text-muted); margin-bottom:0.4rem;">Tipo</label>
                        <select id="reg-tipo" class="form-control" style="width:100%; padding:0.6rem; border-radius:6px; border:1px solid var(--color-border);">
                            <option value="geral">Regulamento Geral</option>
                            <option value="modalidade">Regulamento de uma Modalidade</option>
                        </select>
                    </div>

                    <div id="reg-modalidade-wrap" style="display:none;">
                        <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--color-text-muted); margin-bottom:0.4rem;">Modalidade</label>
                        <input type="text" id="reg-modalidade" list="reg-modalidade-sugestoes" placeholder="Ex: Futebol, Natação, Xadrez..." class="form-control" style="width:100%; padding:0.6rem; border-radius:6px; border:1px solid var(--color-border);">
                        <datalist id="reg-modalidade-sugestoes"></datalist>
                    </div>

                    <div>
                        <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--color-text-muted); margin-bottom:0.4rem;">Arquivo PDF</label>
                        <input type="file" id="reg-arquivo" accept="application/pdf" class="form-control" style="width:100%; padding:0.5rem; border-radius:6px; border:1px solid var(--color-border);">
                    </div>

                    <p id="reg-aviso-substituicao" style="display:none; font-size:0.85rem; color:var(--color-warning); margin:0;">
                        <i data-lucide="alert-triangle" style="width:14px; height:14px; vertical-align:text-bottom;"></i>
                        Já existe um regulamento nesse tipo/modalidade — enviar um novo substitui o atual.
                    </p>

                    <button type="submit" id="btn-enviar-regulamento" class="btn btn-primary" style="align-self:flex-start;">
                        <i data-lucide="upload"></i> Enviar PDF
                    </button>
                </form>
            </div>

            <div class="card">
                <div class="card-header">Regulamentos publicados</div>
                <div id="lista-regulamentos" style="padding: 1.5rem;">
                    <i data-lucide="loader-2" class="spin"></i> Carregando...
                </div>
            </div>
        </div>
    `;
}

let modalidadesCache = [];
let regulamentosCache = [];

async function carregarPagina() {
    const selTipo = document.getElementById('reg-tipo');
    const wrapModalidade = document.getElementById('reg-modalidade-wrap');
    const inputModalidade = document.getElementById('reg-modalidade');
    const sugestoesEl = document.getElementById('reg-modalidade-sugestoes');
    const inputArquivo = document.getElementById('reg-arquivo');
    const avisoSubstituicao = document.getElementById('reg-aviso-substituicao');
    const form = document.getElementById('form-regulamento');
    if (!form) return;

    const [modalidades, regulamentos] = await Promise.all([
        getCollection('modalidades'),
        getCollection('regulamentos')
    ]);
    modalidadesCache = modalidades;
    regulamentosCache = regulamentos;

    // Sugestões (não restringe digitação livre): junta modalidades cadastradas
    // com as que já têm regulamento publicado.
    const nomesSugeridos = new Set([
        ...modalidadesCache.map(m => m.nome).filter(Boolean),
        ...regulamentosCache.filter(r => r.modalidade).map(r => r.modalidade)
    ]);
    sugestoesEl.innerHTML = [...nomesSugeridos].sort((a, b) => a.localeCompare(b))
        .map(nome => `<option value="${nome}"></option>`).join('');

    const atualizarVisibilidade = () => {
        wrapModalidade.style.display = selTipo.value === 'modalidade' ? 'block' : 'none';
        atualizarAvisoSubstituicao();
    };

    const atualizarAvisoSubstituicao = () => {
        const existente = encontrarRegulamentoExistente(selTipo.value, selTipo.value === 'modalidade' ? inputModalidade.value.trim() : null);
        avisoSubstituicao.style.display = existente ? 'block' : 'none';
    };

    selTipo.addEventListener('change', atualizarVisibilidade);
    inputModalidade.addEventListener('input', atualizarAvisoSubstituicao);
    atualizarVisibilidade();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = inputArquivo.files[0];
        if (!file) { alert('Selecione um arquivo PDF.'); return; }
        if (file.type !== 'application/pdf') { alert('O arquivo precisa ser um PDF.'); return; }

        const tipo = selTipo.value;
        const modalidade = tipo === 'modalidade' ? inputModalidade.value.trim() : null;
        if (tipo === 'modalidade' && !modalidade) { alert('Digite o nome da modalidade.'); return; }

        const btn = document.getElementById('btn-enviar-regulamento');
        const textoOriginal = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Enviando...';

        try {
            // Substitui o regulamento existente do mesmo tipo/modalidade, se houver
            const existente = encontrarRegulamentoExistente(tipo, modalidade);
            if (existente) {
                await deleteArquivoStorage(existente.storagePath);
                await deleteDocument('regulamentos', existente.id);
            }

            const resultado = await uploadRegulamento(file);
            if (!resultado) throw new Error('Falha no upload');

            const titulo = tipo === 'geral' ? 'Regulamento Geral' : `Regulamento — ${modalidade}`;
            await addDocument('regulamentos', {
                titulo,
                tipo,
                modalidade: modalidade || null,
                url: resultado.url,
                storagePath: resultado.path,
                nomeArquivo: file.name,
                criado_em: new Date().toISOString()
            });

            form.reset();
            atualizarVisibilidade();
            await recarregarLista();
        } catch (err) {
            console.error('Erro ao enviar regulamento:', err);
            alert('Erro ao enviar o PDF. Tente novamente.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
            if (window.lucide) window.lucide.createIcons();
        }
    });

    renderLista();
    if (window.lucide) window.lucide.createIcons();
}

function encontrarRegulamentoExistente(tipo, modalidade) {
    const alvo = (modalidade || '').toLowerCase();
    return regulamentosCache.find(r => r.tipo === tipo && (tipo === 'geral' || (r.modalidade || '').toLowerCase() === alvo));
}

async function recarregarLista() {
    regulamentosCache = await getCollection('regulamentos');
    renderLista();
    if (window.lucide) window.lucide.createIcons();
}

function renderLista() {
    const container = document.getElementById('lista-regulamentos');
    if (!container) return;

    if (regulamentosCache.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); text-align:center; padding: 1.5rem 0;">Nenhum regulamento publicado ainda.</p>';
        return;
    }

    const geral = regulamentosCache.filter(r => r.tipo === 'geral');
    const porModalidade = regulamentosCache.filter(r => r.tipo === 'modalidade')
        .sort((a, b) => (a.modalidade || '').localeCompare(b.modalidade || ''));

    const linha = (r) => `
        <div style="display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--color-border);">
            <i data-lucide="file-text" style="width:22px; height:22px; color:var(--color-danger); flex-shrink:0;"></i>
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600;">${r.titulo}</div>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">${r.nomeArquivo || ''}</div>
            </div>
            <a href="${r.url}" target="_blank" rel="noopener" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem;"><i data-lucide="eye"></i> Ver</a>
            <button class="btn btn-outline" style="padding:0.4rem 0.6rem; font-size:0.85rem; color:var(--color-danger); border-color:var(--color-danger);" onclick="window.excluirRegulamento('${r.id}','${r.storagePath}')"><i data-lucide="trash-2"></i></button>
        </div>
    `;

    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Geral</h4>
            ${geral.length ? geral.map(linha).join('') : '<p style="color:var(--color-text-muted); font-size:0.9rem;">Nenhum regulamento geral publicado.</p>'}
        </div>
        <div>
            <h4 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Por Modalidade</h4>
            ${porModalidade.length ? porModalidade.map(linha).join('') : '<p style="color:var(--color-text-muted); font-size:0.9rem;">Nenhum regulamento de modalidade publicado.</p>'}
        </div>
    `;
}

window.excluirRegulamento = async (id, storagePath) => {
    if (!confirm('Excluir este regulamento? Essa ação não pode ser desfeita.')) return;
    await deleteArquivoStorage(storagePath);
    await deleteDocument('regulamentos', id);
    await recarregarLista();
};
