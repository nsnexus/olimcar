// public/js/pages/dashboard.js

export function renderDashboardPage() {
    return `
        <div class="container" style="padding-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Painel Administrativo</h2>
                <button id="btn-logout" class="btn btn-outline" style="border-color: var(--color-danger); color: var(--color-danger);">
                    <i data-lucide="log-out"></i> Sair
                </button>
            </div>
            
            <div class="modalidades-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="card" style="padding: 1.5rem; text-align: center; cursor: pointer;">
                    <i data-lucide="users" style="width: 48px; height: 48px; color: var(--color-primary-500); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Gestão de Equipes</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Administrar times e cores</p>
                </div>
                
                <div class="card" style="padding: 1.5rem; text-align: center; cursor: pointer;">
                    <i data-lucide="dribbble" style="width: 48px; height: 48px; color: var(--color-warning); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Modalidades</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Adicionar ou editar esportes</p>
                </div>

                <div class="card" style="padding: 1.5rem; text-align: center; cursor: pointer;">
                    <i data-lucide="swords" style="width: 48px; height: 48px; color: var(--color-success); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Agendar Jogos</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Criar novas disputas</p>
                </div>
            </div>

            <div class="card" style="margin-top: 2rem;">
                <div class="card-header" style="display: flex; justify-content: space-between;">
                    <span>Próximos Jogos Agendados</span>
                    <button id="btn-seed" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">
                        <i data-lucide="database"></i> Inicializar Dados Base (Seed)
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Modalidade</th>
                                <th>Confronto</th>
                                <th>Fase</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="lista-jogos">
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                                    <i data-lucide="loader-2" class="spin"></i> Carregando jogos...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

export async function loadDashboardJogos() {
    const tbody = document.getElementById('lista-jogos');
    if (!tbody) return;

    try {
        const { getCollection } = await import('../services/db.js');
        const jogos = await getCollection('jogos');

        if (jogos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
                        Nenhum jogo agendado ainda. Use o botão de inicializar Seed.
                    </td>
                </tr>
            `;
            return;
        }

        // Mostrar os 10 primeiros por enquanto
        jogos.sort((a, b) => a.data_jogo.localeCompare(b.data_jogo));
        const jogosVisiveis = jogos.slice(0, 10);
        const totalRestante = jogos.length - 10;

        let html = '';
        jogosVisiveis.forEach(jogo => {
            const timeA = jogo.equipe_a?.nome || 'A Definir';
            const timeB = jogo.equipe_b?.nome || 'A Definir';
            
            html += `
                <tr>
                    <td>${jogo.data_jogo} <br> <small>${jogo.horario || '--:--'}</small></td>
                    <td>${jogo.modalidade_texto}</td>
                    <td><strong>${timeA}</strong> x <strong>${timeB}</strong></td>
                    <td>${jogo.fase}</td>
                    <td>
                        <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;"><i data-lucide="edit-2" style="width: 14px; height: 14px;"></i></button>
                    </td>
                </tr>
            `;
        });
        
        if (totalRestante > 0) {
            html += `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">+ ${totalRestante} jogos agendados... Ver página de Agenda completa.</td></tr>`;
        }

        tbody.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Erro ao ler jogos.</td></tr>`;
    }
}
