// public/js/pages/regulamento.js
import { getCollection } from '../services/db.js?v=20260912c';

export function renderRegulamentoPage() {
    setTimeout(carregarRegulamentos, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="text-align:center; margin-bottom: 2.5rem;">
                <h2 style="font-size: 2.2rem; color: var(--color-primary-800); margin-bottom: 0.5rem;">Regulamento Oficial</h2>
                <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 620px; margin: 0 auto;">
                    Consulte o regulamento geral da Olimcar e os regulamentos específicos de cada modalidade.
                </p>
            </div>

            <div id="regulamento-geral-wrap" style="margin-bottom: 3rem;">
                <div style="text-align:center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i></div>
            </div>

            <div class="card" style="padding: 2rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
                    <h3 style="margin:0; color: var(--color-primary-800);">Regulamentos por Modalidade</h3>
                    <select id="filtro-regulamento-modalidade" class="form-control" style="width:auto; min-width:220px; padding:0.5rem 0.75rem; border-radius:6px; border:1px solid var(--color-border);">
                        <option value="">Todas as Modalidades</option>
                    </select>
                </div>
                <div id="lista-regulamentos-modalidade">
                    <div style="text-align:center; padding: 2rem;"><i data-lucide="loader-2" class="spin"></i></div>
                </div>
            </div>
        </div>
    `;
}

async function carregarRegulamentos() {
    const wrapGeral = document.getElementById('regulamento-geral-wrap');
    const selectFiltro = document.getElementById('filtro-regulamento-modalidade');
    const listaEl = document.getElementById('lista-regulamentos-modalidade');
    if (!wrapGeral) return;

    try {
        const regulamentos = await getCollection('regulamentos');

        const geral = regulamentos.find(r => r.tipo === 'geral');
        wrapGeral.innerHTML = geral ? `
            <div class="card" style="padding: 2rem; display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; border: 1px solid var(--color-primary-500);">
                <i data-lucide="scroll-text" style="width:56px; height:56px; color: var(--color-primary-500); flex-shrink:0;"></i>
                <div style="flex:1; min-width:240px;">
                    <h3 style="margin-bottom:0.35rem; color: var(--color-primary-800);">Regulamento Geral</h3>
                    <p style="margin:0; color: var(--color-text-muted); font-size:0.9rem;">Regras oficiais da Olimcar 2026, válidas para todas as modalidades.</p>
                </div>
                <a href="${geral.url}" target="_blank" rel="noopener" class="btn btn-primary" style="white-space:nowrap;"><i data-lucide="file-text"></i> Abrir PDF</a>
            </div>
        ` : `
            <div class="card" style="padding: 2rem; text-align:center; color: var(--color-text-muted);">
                <i data-lucide="scroll-text" style="width:40px; height:40px; margin-bottom:0.75rem;"></i>
                <p>O regulamento geral ainda não foi publicado.</p>
            </div>
        `;

        const porModalidade = regulamentos.filter(r => r.tipo === 'modalidade')
            .sort((a, b) => (a.modalidade || '').localeCompare(b.modalidade || ''));

        porModalidade.forEach(r => selectFiltro.add(new Option(r.modalidade, r.modalidade)));

        const renderLista = (filtro) => {
            const filtrados = filtro ? porModalidade.filter(r => r.modalidade === filtro) : porModalidade;

            if (filtrados.length === 0) {
                listaEl.innerHTML = `<p style="color: var(--color-text-muted); text-align:center; padding: 1.5rem 0;">
                    ${filtro ? 'Nenhum regulamento encontrado para essa modalidade.' : 'Nenhum regulamento específico de modalidade publicado ainda.'}
                </p>`;
                return;
            }

            listaEl.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:1rem;">
                ${filtrados.map(r => `
                    <div class="card" style="padding: 1.25rem; display:flex; align-items:center; gap:1rem;">
                        <i data-lucide="file-text" style="width:28px; height:28px; color: var(--color-danger); flex-shrink:0;"></i>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:600;">${r.modalidade}</div>
                        </div>
                        <a href="${r.url}" target="_blank" rel="noopener" class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.85rem; white-space:nowrap;">Abrir</a>
                    </div>
                `).join('')}
            </div>`;
            if (window.lucide) window.lucide.createIcons();
        };

        selectFiltro.addEventListener('change', (e) => renderLista(e.target.value));
        renderLista('');

        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        console.error(e);
        wrapGeral.innerHTML = '<p style="color: var(--color-danger); text-align:center;">Erro ao carregar os regulamentos.</p>';
        listaEl.innerHTML = '';
    }
}
