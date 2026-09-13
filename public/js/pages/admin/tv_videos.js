// public/js/pages/admin/tv_videos.js
import { getCollection, addDocument, updateDocument, deleteDocument, uploadTvVideo, deleteArquivoStorage } from '../../services/db.js?v=20260912a';

export function renderTvVideosAdminPage() {
    setTimeout(carregarPagina, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Vídeos do Painel de TV</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar</button>
            </div>

            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 640px;">
                Vídeos entram no loop do <a href="/tv.html" target="_blank">Painel de TV</a> na ordem daqui.
                Sem nenhum vídeo, o painel mostra a marca Olimcar no lugar. Recomendado: MP4 (H.264), até ~50MB, Full HD.
            </p>

            <div class="card" style="padding: 2rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.25rem;">Enviar novo vídeo</h3>
                <form id="form-tv-video" style="display: flex; flex-direction: column; gap: 1.1rem; max-width: 520px;">
                    <div>
                        <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--color-text-muted); margin-bottom:0.4rem;">Título (identificação interna)</label>
                        <input type="text" id="tv-titulo" placeholder="Ex: Abertura, Patrocinadores..." class="form-control" style="width:100%; padding:0.6rem; border-radius:6px; border:1px solid var(--color-border);">
                    </div>

                    <div>
                        <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--color-text-muted); margin-bottom:0.4rem;">Arquivo de vídeo</label>
                        <input type="file" id="tv-arquivo" accept="video/*" class="form-control" style="width:100%; padding:0.5rem; border-radius:6px; border:1px solid var(--color-border);">
                    </div>

                    <button type="submit" id="btn-enviar-tv-video" class="btn btn-primary" style="align-self:flex-start;">
                        <i data-lucide="upload"></i> Enviar vídeo
                    </button>
                    <div id="tv-progresso" style="display:none; font-size:0.85rem; color: var(--color-text-muted);"></div>
                </form>
            </div>

            <div class="card">
                <div class="card-header">Vídeos no loop</div>
                <div id="lista-tv-videos" style="padding: 1.5rem;">
                    <i data-lucide="loader-2" class="spin"></i> Carregando...
                </div>
            </div>
        </div>
    `;
}

let videosCache = [];

async function carregarPagina() {
    const form = document.getElementById('form-tv-video');
    if (!form) return;

    videosCache = await ordenarPorOrdem(await getCollection('tv_videos'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputArquivo = document.getElementById('tv-arquivo');
        const inputTitulo = document.getElementById('tv-titulo');
        const file = inputArquivo.files[0];
        if (!file) { alert('Selecione um arquivo de vídeo.'); return; }
        if (!file.type.startsWith('video/')) { alert('O arquivo precisa ser um vídeo.'); return; }

        const btn = document.getElementById('btn-enviar-tv-video');
        const progresso = document.getElementById('tv-progresso');
        const textoOriginal = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Enviando...';
        progresso.style.display = 'block';
        progresso.textContent = `Enviando ${(file.size / 1024 / 1024).toFixed(1)}MB — pode levar alguns minutos, não feche a página.`;

        try {
            const resultado = await uploadTvVideo(file);
            if (!resultado) throw new Error('Falha no upload');

            const maxOrdem = videosCache.reduce((m, v) => Math.max(m, v.ordem ?? 0), 0);
            await addDocument('tv_videos', {
                titulo: inputTitulo.value.trim() || file.name,
                url: resultado.url,
                storagePath: resultado.path,
                nomeArquivo: file.name,
                tamanho: file.size,
                ordem: maxOrdem + 1,
                criado_em: new Date().toISOString()
            });

            form.reset();
            await recarregarLista();
        } catch (err) {
            console.error('Erro ao enviar vídeo da TV:', err);
            alert('Erro ao enviar o vídeo. Tente novamente.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = textoOriginal;
            progresso.style.display = 'none';
            if (window.lucide) window.lucide.createIcons();
        }
    });

    renderLista();
    if (window.lucide) window.lucide.createIcons();
}

async function ordenarPorOrdem(lista) {
    return lista.slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
}

async function recarregarLista() {
    videosCache = await ordenarPorOrdem(await getCollection('tv_videos'));
    renderLista();
    if (window.lucide) window.lucide.createIcons();
}

function formatarTamanho(bytes) {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
}

function renderLista() {
    const container = document.getElementById('lista-tv-videos');
    if (!container) return;

    if (videosCache.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); text-align:center; padding: 1.5rem 0;">Nenhum vídeo enviado ainda. O painel mostra a marca Olimcar no lugar.</p>';
        return;
    }

    container.innerHTML = videosCache.map((v, i) => `
        <div style="display:flex; align-items:center; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--color-border);">
            <div style="display:flex; flex-direction:column; gap:0.15rem;">
                <button class="btn btn-outline" style="padding:0.15rem 0.4rem;" title="Mover pra cima" ${i === 0 ? 'disabled' : ''} onclick="window.moverTvVideo('${v.id}', -1)"><i data-lucide="chevron-up" style="width:14px; height:14px;"></i></button>
                <button class="btn btn-outline" style="padding:0.15rem 0.4rem;" title="Mover pra baixo" ${i === videosCache.length - 1 ? 'disabled' : ''} onclick="window.moverTvVideo('${v.id}', 1)"><i data-lucide="chevron-down" style="width:14px; height:14px;"></i></button>
            </div>
            <i data-lucide="video" style="width:22px; height:22px; color:var(--color-info); flex-shrink:0;"></i>
            <div style="flex:1; min-width:0;">
                <div style="font-weight:600;">${i + 1}. ${v.titulo}</div>
                <div style="font-size:0.8rem; color:var(--color-text-muted);">${v.nomeArquivo || ''}${v.tamanho ? ` &middot; ${formatarTamanho(v.tamanho)}` : ''}</div>
            </div>
            <a href="${v.url}" target="_blank" rel="noopener" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem;"><i data-lucide="eye"></i> Ver</a>
            <button class="btn btn-outline" style="padding:0.4rem 0.6rem; font-size:0.85rem; color:var(--color-danger); border-color:var(--color-danger);" onclick="window.excluirTvVideo('${v.id}','${v.storagePath}')"><i data-lucide="trash-2"></i></button>
        </div>
    `).join('');
}

window.moverTvVideo = async (id, direcao) => {
    const i = videosCache.findIndex(v => v.id === id);
    const j = i + direcao;
    if (i < 0 || j < 0 || j >= videosCache.length) return;

    const a = videosCache[i], b = videosCache[j];
    const ordemA = a.ordem ?? 0, ordemB = b.ordem ?? 0;
    await Promise.all([
        updateDocument('tv_videos', a.id, { ordem: ordemB }),
        updateDocument('tv_videos', b.id, { ordem: ordemA })
    ]);
    await recarregarLista();
};

window.excluirTvVideo = async (id, storagePath) => {
    if (!confirm('Excluir este vídeo? Essa ação não pode ser desfeita.')) return;
    await deleteArquivoStorage(storagePath);
    await deleteDocument('tv_videos', id);
    await recarregarLista();
};
