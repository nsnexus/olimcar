// public/js/pages/admin/jogo_editor.js

export function renderJogoEditorPage() {
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Editar Súmula do Jogo</h2>
                <button class="btn btn-outline" onclick="window.history.back()">Cancelar</button>
            </div>
            
            <div class="card" style="text-align: center; padding: 4rem;">
                <i data-lucide="pen-tool" style="width: 48px; height: 48px; color: var(--color-text-muted); margin-bottom: 1rem;"></i>
                <h3>Editor de Jogo em Construção</h3>
                <p style="color: var(--color-text-muted);">Aqui você irá preencher o placar da equipe A e B, e finalizar a partida (atualizando o Ranking).</p>
            </div>
        </div>
    `;
}
