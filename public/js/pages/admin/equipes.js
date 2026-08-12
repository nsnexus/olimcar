// public/js/pages/admin/equipes.js

export function renderEquipesPage() {
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Gestão de Equipes e Inscritos</h2>
                <button class="btn btn-outline" onclick="window.history.back()">Voltar</button>
            </div>
            
            <div class="card" style="text-align: center; padding: 4rem;">
                <i data-lucide="users" style="width: 48px; height: 48px; color: var(--color-text-muted); margin-bottom: 1rem;"></i>
                <h3>Módulo de Equipes em Construção</h3>
                <p style="color: var(--color-text-muted);">Aqui você poderá cadastrar os nomes das equipes, cores, e gerenciar os membros inscritos de cada time.</p>
            </div>
        </div>
    `;
}
