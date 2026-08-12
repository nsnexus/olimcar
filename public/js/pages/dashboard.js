// public/js/pages/dashboard.js

let todosJogosAdmin = [];

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
                <div class="card" onclick="window.location.hash='/admin/equipes'" style="padding: 1.5rem; text-align: center; cursor: pointer; transition: transform 0.2s;">
                    <i data-lucide="users" style="width: 48px; height: 48px; color: var(--color-primary-500); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Gestão de Equipes</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Administrar times e inscritos</p>
                </div>
                
                <div class="card" onclick="window.location.hash='/admin/modalidades'" style="padding: 1.5rem; text-align: center; cursor: pointer; transition: transform 0.2s;">
                    <i data-lucide="dribbble" style="width: 48px; height: 48px; color: var(--color-warning); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Modalidades</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Ver regras e pontos</p>
                </div>

                <div class="card" onclick="window.location.hash='/admin/jogo'" style="padding: 1.5rem; text-align: center; cursor: pointer; transition: transform 0.2s;">
                    <i data-lucide="calendar-plus" style="width: 48px; height: 48px; color: var(--color-success); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Agendar Jogo</h3>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Cadastrar partida manual</p>
                </div>
            </div>

            <div class="card" style="margin-top: 2rem;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <span>Gerenciar Jogos e Resultados</span>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <select id="admin-filter-data" class="form-control" style="font-size: 0.85rem; padding: 0.3rem;"><option value="">Todas Datas</option></select>
                        <select id="admin-filter-modalidade" class="form-control" style="font-size: 0.85rem; padding: 0.3rem;"><option value="">Todas Modalidades</option></select>
                    </div>

                    <button id="btn-seed" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; display: none;">
                        <i data-lucide="database"></i> Seed Base
                    </button>
                </div>
                
                <div class="table-container" style="max-height: 500px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead style="position: sticky; top: 0; background: var(--color-surface); z-index: 10;">
                            <tr>
                                <th>Data / Hora</th>
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
        const { getCollection, sortByDateAndTime, deleteDocument } = await import('../services/db.js');
        const jogosBrutos = await getCollection('jogos');
        
        todosJogosAdmin = jogosBrutos.filter(j => 
            j.modalidade_texto && j.modalidade_texto.toUpperCase() !== 'MODALIDADE' &&
            j.data_jogo && j.data_jogo.toUpperCase() !== 'DATA' && j.data_jogo.trim() !== ''
        );

        if (todosJogosAdmin.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Nenhum jogo. (Ative o botão Seed via código se precisar)</td></tr>';
            return;
        }

        sortByDateAndTime(todosJogosAdmin);
        
        const datas = new Set();
        const modalidades = new Set();
        todosJogosAdmin.forEach(j => { datas.add(j.data_jogo); modalidades.add(j.modalidade_texto); });
        
        const selData = document.getElementById('admin-filter-data');
        const selMod = document.getElementById('admin-filter-modalidade');
        
        Array.from(datas).sort().forEach(d => selData.add(new Option(d, d)));
        Array.from(modalidades).sort().forEach(m => selMod.add(new Option(m, m)));
        
        selData.addEventListener('change', renderAdminJogos);
        selMod.addEventListener('change', renderAdminJogos);

        renderAdminJogos();

        // Expõe a função de exclusão globalmente
        window.excluirJogo = async (id) => {
            if (confirm("Tem certeza que deseja excluir esta partida da agenda?")) {
                const sucesso = await deleteDocument('jogos', id);
                if (sucesso) {
                    todosJogosAdmin = todosJogosAdmin.filter(j => j.id !== id);
                    renderAdminJogos();
                } else {
                    alert("Erro ao excluir jogo. Verifique suas permissões.");
                }
            }
        };

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Erro ao ler jogos.</td></tr>`;
    }
}

function renderAdminJogos() {
    const tbody = document.getElementById('lista-jogos');
    const valData = document.getElementById('admin-filter-data').value;
    const valMod = document.getElementById('admin-filter-modalidade').value;

    const filtrados = todosJogosAdmin.filter(jogo => {
        return (!valData || jogo.data_jogo === valData) && (!valMod || jogo.modalidade_texto === valMod);
    });

    if(filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum jogo atende aos filtros.</td></tr>';
        return;
    }

    let html = '';
    filtrados.forEach(jogo => {
        const timeA = jogo.equipe_a?.nome || 'A Definir';
        const timeB = jogo.equipe_b?.nome || 'A Definir';
        const statusBadge = jogo.status === 'encerrado' ? '<span style="color:var(--color-success); font-size: 0.7rem; display:block;">ENCERRADO</span>' : '';
        
        html += `
            <tr>
                <td>${jogo.data_jogo} <br> <small>${jogo.horario || '--:--'}</small></td>
                <td>${jogo.modalidade_texto}</td>
                <td>
                    <strong>${timeA}</strong> <span style="color:var(--color-text-muted);">x</span> <strong>${timeB}</strong>
                    ${jogo.status === 'encerrado' ? `<br><small style="color:var(--color-primary-500); font-weight:bold;">${jogo.placar_a} x ${jogo.placar_b}</small>` : ''}
                </td>
                <td>${jogo.fase} ${statusBadge}</td>
                <td>
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="window.location.hash='/admin/jogo?id=${jogo.id}'" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" title="Editar Agenda/Local">
                            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i> Agenda
                        </button>
                        <button onclick="window.location.hash='/admin/sumula?id=${jogo.id}'" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-primary-600); border: none;" title="Preencher Súmula e Placar">
                            <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Súmula
                        </button>
                        <button onclick="excluirJogo('${jogo.id}')" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--color-danger); border-color: var(--color-danger);" title="Excluir Jogo">
                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
}
