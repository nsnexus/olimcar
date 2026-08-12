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

            <!-- NAVEGAÇÃO POR ABAS -->
            <div style="margin-top: 2rem; border-bottom: 1px solid var(--color-border); display: flex; gap: 1rem;">
                <button id="tab-btn-jogos" style="padding: 0.5rem 1rem; border: none; background: transparent; border-bottom: 3px solid var(--color-primary-600); color: var(--color-primary-700); font-weight: bold; cursor: pointer; font-size: 1rem;">Jogos e Resultados</button>
                <button id="tab-btn-inscricoes" style="padding: 0.5rem 1rem; border: none; background: transparent; border-bottom: 3px solid transparent; color: var(--color-text-muted); font-weight: 500; cursor: pointer; font-size: 1rem;">Base de Inscrições</button>
            </div>

            <!-- CONTEÚDO: ABA JOGOS -->
            <div id="tab-content-jogos">
                <div class="card" style="margin-top: 1.5rem;">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <span>Gerenciar Jogos e Resultados</span>
                        
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <select id="admin-filter-data" class="form-control" style="padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                                <option value="">Todas Datas</option>
                            </select>
                            <select id="admin-filter-modalidade" class="form-control" style="padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                                <option value="">Todas Modalidades</option>
                            </select>
                            <select id="admin-filter-equipe" class="form-control" style="padding: 0.3rem; font-size: 0.85rem; border-radius: 4px; border: 1px solid var(--color-border);">
                                <option value="">Todas as Equipes</option>
                            </select>
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
        </div> <!-- fecha aba jogos -->

            <!-- CONTEÚDO: ABA INSCRIÇÕES -->
            <div id="tab-content-inscricoes" style="display: none; margin-top: 1.5rem;">
                <div class="card" style="padding: 3rem 2rem; text-align: center; border: 2px dashed var(--color-primary-400); background: var(--color-surface);">
                    <i data-lucide="users" style="width: 48px; height: 48px; color: var(--color-primary-600); margin-bottom: 1rem;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-primary-800);">Importar Base de Inscrições</h3>
                    <p style="color: var(--color-text-muted); margin-bottom: 2rem; font-size: 1.1rem; max-width: 600px; margin-left: auto; margin-right: auto;">
                        Carregue a planilha oficial (.xlsx) de inscrições gerada pelo Forms para criar o banco de dados dos atletas e preencher o Painel dos Líderes de Equipe.
                    </p>
                    
                    <input type="file" id="upload-inscricoes" accept=".xlsx, .xls, .csv" style="display: none;">
                    <button id="btn-importar-inscricoes" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem; border-radius: 50px;">
                        <i data-lucide="upload" style="margin-right: 8px;"></i> Selecionar e Importar Planilha
                    </button>
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
        const equipes = new Set();
        todosJogosAdmin.forEach(j => { 
            datas.add(j.data_jogo); 
            modalidades.add(j.modalidade_texto); 
            if(j.equipe_a?.nome && j.equipe_a.nome !== 'A Definir') equipes.add(j.equipe_a.nome);
            if(j.equipe_b?.nome && j.equipe_b.nome !== 'A Definir') equipes.add(j.equipe_b.nome);
        });
        
        const selData = document.getElementById('admin-filter-data');
        const selMod = document.getElementById('admin-filter-modalidade');
        const selEq = document.getElementById('admin-filter-equipe');
        
        Array.from(datas).sort().forEach(d => selData.add(new Option(d, d)));
        Array.from(modalidades).sort().forEach(m => selMod.add(new Option(m, m)));
        Array.from(equipes).sort().forEach(e => selEq.add(new Option(e, e)));
        
        selData.addEventListener('change', renderAdminJogos);
        selMod.addEventListener('change', renderAdminJogos);
        selEq.addEventListener('change', renderAdminJogos);

        renderAdminJogos();

        // Expõe a função de exclusão globalmente
        window.excluirJogo = async (id) => {
            if (confirm("Tem certeza que deseja excluir esta partida da agenda?")) {
                const { deleteDocument } = await import('../services/db.js');
                const sucesso = await deleteDocument('jogos', id);
                if (sucesso) {
                    todosJogosAdmin = todosJogosAdmin.filter(j => j.id !== id);
                    renderAdminJogos();
                } else {
                    alert("Erro ao excluir jogo. Verifique suas permissões.");
                }
            }
        };

        // Botão de Importação de Inscrições
        const btnUpload = document.getElementById('btn-importar-inscricoes');
        const inputUpload = document.getElementById('upload-inscricoes');

        if (btnUpload && inputUpload) {
            btnUpload.addEventListener('click', () => inputUpload.click());

            inputUpload.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                btnUpload.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processando...';
                
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (json.length > 1) {
                        const { getCollection, addDocument } = await import('../services/db.js');
                        
                        let importedCount = 0;
                        const headerLine = json[0];
                        const { getCollection, addDocument } = await import('../services/db.js');
                        
                        // Buscar todos que já estão no banco para checar duplicados
                        const existentes = await getCollection('colaboradores');
                        const matriculasCobradas = new Set(existentes.map(c => String(c.matricula).trim()).filter(m => m.length > 0));
                        const promessasInscricoes = [];

                        for (let i = 1; i < json.length; i++) {
                            const row = json[i];
                            if (!row || row.length < 5 || !row[1]) continue; // Se não tem nome, pula
                            
                            // Regex para normalizar nome da equipe
                            let equipeLimpa = "Sem Equipe";
                            const timeBruto = String(row[5] || "");
                            if (timeBruto.toLowerCase().includes('azul')) equipeLimpa = "Equipe Azul";
                            else if (timeBruto.toLowerCase().includes('amarela') || timeBruto.toLowerCase().includes('amarelo')) equipeLimpa = "Equipe Amarela";
                            else if (timeBruto.toLowerCase().includes('verde')) equipeLimpa = "Equipe Verde";
                            else if (timeBruto.toLowerCase().includes('vermelha') || timeBruto.toLowerCase().includes('vermelho')) equipeLimpa = "Equipe Vermelha";

                            // Capturar todas as modalidades a partir da coluna 6
                            let mods = [];
                            for (let c = 6; c < row.length; c++) {
                                if (row[c]) mods.push(headerLine[c]);
                            }

                            const matriculaClean = String(row[3] || "").trim();
                            
                            // IGNORAR SE JÁ EXISTE NO BANCO (Tratamento de duplicatas via sistema sem usar SetDoc)
                            if (matriculaClean && matriculasCobradas.has(matriculaClean)) {
                                continue;
                            }

                            const colaborador = {
                                nome: row[1],
                                whatsapp: String(row[2] || ""),
                                matricula: matriculaClean,
                                vinculo: row[4] || "Colaborador",
                                equipe: equipeLimpa,
                                modalidades: mods,
                                status: 'Ativo'
                            };

                            // Adicionar à fila e também ao Set local para não duplicar no próprio arquivo
                            if (matriculaClean) matriculasCobradas.add(matriculaClean);
                            promessasInscricoes.push(addDocument('colaboradores', colaborador));
                        }
                        
                        await Promise.all(promessasInscricoes);
                        alert(`Sucesso! ${promessasInscricoes.length} NOVAS inscrições importadas.`);
                    }
                } catch (error) {
                    console.error("Erro ao importar planilha:", error);
                    alert("Erro ao ler o arquivo Excel. Verifique se o formato está correto.");
                } finally {
                    inputUpload.value = ''; // reseta
                    btnUpload.innerHTML = '<i data-lucide="upload"></i> Importar Inscrições';
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }

        const btnTabJogos = document.getElementById('tab-btn-jogos');
        const btnTabInscricoes = document.getElementById('tab-btn-inscricoes');
        const contentJogos = document.getElementById('tab-content-jogos');
        const contentInscricoes = document.getElementById('tab-content-inscricoes');

        if (btnTabJogos && btnTabInscricoes) {
            btnTabJogos.addEventListener('click', () => {
                contentJogos.style.display = 'block';
                contentInscricoes.style.display = 'none';
                btnTabJogos.style.borderBottomColor = 'var(--color-primary-600)';
                btnTabJogos.style.color = 'var(--color-primary-700)';
                btnTabJogos.style.fontWeight = 'bold';
                btnTabInscricoes.style.borderBottomColor = 'transparent';
                btnTabInscricoes.style.color = 'var(--color-text-muted)';
                btnTabInscricoes.style.fontWeight = '500';
            });
            btnTabInscricoes.addEventListener('click', () => {
                contentJogos.style.display = 'none';
                contentInscricoes.style.display = 'block';
                btnTabInscricoes.style.borderBottomColor = 'var(--color-primary-600)';
                btnTabInscricoes.style.color = 'var(--color-primary-700)';
                btnTabInscricoes.style.fontWeight = 'bold';
                btnTabJogos.style.borderBottomColor = 'transparent';
                btnTabJogos.style.color = 'var(--color-text-muted)';
                btnTabJogos.style.fontWeight = '500';
            });
        }

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-danger);">Erro ao ler jogos.</td></tr>`;
    }
}

function renderAdminJogos() {
    const tbody = document.getElementById('lista-jogos');
    const valData = document.getElementById('admin-filter-data').value;
    const valMod = document.getElementById('admin-filter-modalidade').value;
    const valEq = document.getElementById('admin-filter-equipe').value;

    const filtrados = todosJogosAdmin.filter(j => {
        const matchData = !valData || j.data_jogo === valData;
        const matchMod = !valMod || j.modalidade_texto === valMod;
        const timeA = j.equipe_a?.nome || 'A Definir';
        const timeB = j.equipe_b?.nome || 'A Definir';
        const matchEq = !valEq || timeA === valEq || timeB === valEq;
        return matchData && matchMod && matchEq;
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
