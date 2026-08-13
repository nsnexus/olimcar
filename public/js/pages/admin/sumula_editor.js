// public/js/pages/admin/sumula_editor.js
import { getDocument, updateDocument, uploadEvidencia, getCollection } from '../../services/db.js';

let jogoAtual = null;

function ehFaseProva(fase) {
    return (fase || '').trim().toUpperCase() === 'PROVA';
}

export function renderSumulaEditorPage() {
    setTimeout(loadSumulaData, 50);

    return `
        <div class="container" style="padding-top: 2rem; max-width: 800px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Preencher Súmula (Placar)</h2>
                <button class="btn btn-outline" onclick="window.history.back()"><i data-lucide="arrow-left"></i> Voltar</button>
            </div>
            
            <div id="editor-loading" style="text-align: center; padding: 4rem;">
                <i data-lucide="loader-2" class="spin"></i> Buscando partida...
            </div>
            
            <div id="editor-content" style="display: none;">
                <div class="card" style="margin-bottom: 2rem; background: var(--color-bg-body);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span style="font-weight: 600; color: var(--color-primary-600); font-size: 1.1rem;" id="lbl-modalidade">-</span>
                        <span id="badge-status" style="font-size: 0.85rem; padding: 0.35rem 0.75rem; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 6px; font-weight: 600;"></span>
                    </div>
                    <div style="color: var(--color-text-muted); font-size: 0.95rem;">
                        <span id="lbl-fase"></span> &bull; <span id="lbl-data"></span> &bull; <span id="lbl-local"></span>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Súmula Oficial</div>

                    <div id="bloco-confronto" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2.5rem; background: var(--color-bg-body); padding: 2rem; border-radius: var(--radius-md);">
                        <div style="flex: 1; text-align: right;">
                            <h3 id="lbl-equipe-a" style="margin-bottom: 0.75rem; font-size: 1.25rem;">Equipe A</h3>
                            <input type="number" id="input-placar-a" class="form-control" style="width: 100px; text-align: center; font-size: 2rem; font-weight: 800; margin-left: auto; height: 60px;" min="0">
                        </div>

                        <div style="font-size: 1.5rem; color: var(--color-text-muted); font-weight: 800; padding: 0 1rem;">X</div>

                        <div style="flex: 1;">
                            <h3 id="lbl-equipe-b" style="margin-bottom: 0.75rem; font-size: 1.25rem;">Equipe B</h3>
                            <input type="number" id="input-placar-b" class="form-control" style="width: 100px; text-align: center; font-size: 2rem; font-weight: 800; height: 60px;" min="0">
                        </div>
                    </div>

                    <div id="bloco-prova" style="display: none; margin-bottom: 2.5rem; background: var(--color-bg-body); padding: 2rem; border-radius: var(--radius-md);">
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Prova disputada por todas as equipes ao mesmo tempo. Defina a colocação final de cada uma:</p>
                        <div id="lista-colocacoes" style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <!-- Injetado via JS -->
                        </div>
                        <p id="msg-colocacoes" style="color: var(--color-danger); font-size: 0.85rem; margin-top: 1rem; display: none;">Cada equipe precisa de uma colocação diferente (1º a 4º).</p>

                        <div id="bloco-conclusoes" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border);">
                            <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Quantos atletas de cada equipe concluíram a corrida (+1 ponto cada):</p>
                            <div id="lista-conclusoes" style="display: flex; flex-direction: column; gap: 0.75rem;">
                                <!-- Injetado via JS -->
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div class="form-group">
                            <label class="form-label">Status da Partida</label>
                            <select id="input-status" class="form-control">
                                <option value="agendado">Agendado</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="encerrado">Encerrado (Finalizado)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Evidência (Foto da Súmula)</label>
                            <input type="file" id="input-evidencia" class="form-control" accept="image/*,.pdf" style="padding: 0.6rem;">
                            
                            <div id="evidencia-preview-container" style="margin-top: 1rem; display: none;">
                                <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Evidência Atual:</p>
                                <a id="link-evidencia" href="#" target="_blank" class="btn btn-outline" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                                    <i data-lucide="external-link"></i> Visualizar Arquivo Anexado
                                </a>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
                        <button class="btn btn-primary" id="btn-salvar-sumula">
                            <i data-lucide="save"></i> Salvar Placar Oficial
                        </button>
                    </div>
                    <p id="msg-feedback" style="text-align: right; margin-top: 1rem; font-size: 0.95rem; font-weight: 500;"></p>
                </div>
            </div>
        </div>
    `;
}

async function loadSumulaData() {
    const hashParams = window.location.hash.split('?')[1];
    const params = new URLSearchParams(hashParams);
    const jogoId = params.get('id');

    if (!jogoId) {
        document.getElementById('editor-loading').innerHTML = "ID da partida não informado.";
        return;
    }

    jogoAtual = await getDocument('jogos', jogoId);
    
    if (!jogoAtual) {
        document.getElementById('editor-loading').innerHTML = "Partida não encontrada.";
        return;
    }

    // Preencher Tela (Read Only para as infos, afinal é só a tela de súmula)
    document.getElementById('lbl-modalidade').innerText = jogoAtual.modalidade_texto || 'Modalidade Desconhecida';
    document.getElementById('lbl-data').innerText = (jogoAtual.data_jogo || '-') + ' às ' + (jogoAtual.horario || '-');
    document.getElementById('lbl-local').innerText = jogoAtual.local || '-';
    document.getElementById('lbl-fase').innerText = jogoAtual.fase || '-';

    document.getElementById('lbl-equipe-a').innerText = jogoAtual.equipe_a?.nome || 'A Definir';
    document.getElementById('lbl-equipe-b').innerText = jogoAtual.equipe_b?.nome || 'A Definir';
    
    document.getElementById('input-placar-a').value = jogoAtual.placar_a || 0;
    document.getElementById('input-placar-b').value = jogoAtual.placar_b || 0;
    document.getElementById('input-status').value = jogoAtual.status || 'agendado';

    const isCorrida = jogoAtual.categoria === 'corrida';
    const isMultiEquipe = ehFaseProva(jogoAtual.fase) || isCorrida;

    if (isMultiEquipe) {
        document.getElementById('bloco-confronto').style.display = 'none';
        document.getElementById('bloco-prova').style.display = 'block';
        await popularColocacoes(jogoAtual.colocacoes || {});

        document.getElementById('bloco-conclusoes').style.display = isCorrida ? 'block' : 'none';
        if (isCorrida) {
            await popularConclusoes(jogoAtual.conclusoes || {});
        }
    } else {
        document.getElementById('bloco-confronto').style.display = 'flex';
        document.getElementById('bloco-prova').style.display = 'none';
    }


    // Mostra link da evidência se existir
    if (jogoAtual.evidencia_url) {
        document.getElementById('evidencia-preview-container').style.display = 'block';
        document.getElementById('link-evidencia').href = jogoAtual.evidencia_url;
    }
    
    const badgeMap = { 'agendado': '⏳ Agendado', 'andamento': '🔥 Em andamento', 'encerrado': '✅ Encerrado' };
    document.getElementById('badge-status').innerText = badgeMap[jogoAtual.status || 'agendado'];

    document.getElementById('editor-loading').style.display = 'none';
    document.getElementById('editor-content').style.display = 'block';

    document.getElementById('btn-salvar-sumula').addEventListener('click', salvarSumula);
    if (window.lucide) window.lucide.createIcons();
}

async function popularColocacoes(colocacoesExistentes) {
    const equipesDB = await getCollection('equipes');
    const container = document.getElementById('lista-colocacoes');

    container.innerHTML = equipesDB.map(eq => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--color-bg-card); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
            <span style="font-weight: 600;">${eq.nome}</span>
            <select class="form-control input-colocacao" data-equipe="${eq.nome}" style="width: auto; padding: 0.4rem 0.75rem;">
                <option value="">-</option>
                <option value="1">1º lugar</option>
                <option value="2">2º lugar</option>
                <option value="3">3º lugar</option>
                <option value="4">4º lugar</option>
            </select>
        </div>
    `).join('');

    container.querySelectorAll('.input-colocacao').forEach(select => {
        const equipe = select.dataset.equipe;
        if (colocacoesExistentes[equipe]) {
            select.value = colocacoesExistentes[equipe];
        }
    });
}

async function popularConclusoes(conclusoesExistentes) {
    const equipesDB = await getCollection('equipes');
    const container = document.getElementById('lista-conclusoes');

    container.innerHTML = equipesDB.map(eq => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--color-bg-card); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
            <span style="font-weight: 600;">${eq.nome}</span>
            <input type="number" min="0" class="form-control input-conclusao" data-equipe="${eq.nome}" style="width: 90px; padding: 0.4rem 0.75rem;" placeholder="0">
        </div>
    `).join('');

    container.querySelectorAll('.input-conclusao').forEach(input => {
        const equipe = input.dataset.equipe;
        if (conclusoesExistentes[equipe] !== undefined) {
            input.value = conclusoesExistentes[equipe];
        }
    });
}

function coletarConclusoes() {
    const inputs = document.querySelectorAll('.input-conclusao');
    const conclusoes = {};
    inputs.forEach(input => {
        conclusoes[input.dataset.equipe] = parseInt(input.value) || 0;
    });
    return conclusoes;
}

function coletarColocacoes() {
    const selects = document.querySelectorAll('.input-colocacao');
    const colocacoes = {};
    const posicoesUsadas = [];

    selects.forEach(select => {
        if (select.value) {
            colocacoes[select.dataset.equipe] = parseInt(select.value);
            posicoesUsadas.push(select.value);
        }
    });

    const todasPreenchidas = selects.length > 0 && posicoesUsadas.length === selects.length;
    const semDuplicadas = new Set(posicoesUsadas).size === posicoesUsadas.length;

    return { colocacoes, valido: todasPreenchidas && semDuplicadas };
}

async function salvarSumula() {
    const btn = document.getElementById('btn-salvar-sumula');
    const msg = document.getElementById('msg-feedback');
    const fileInput = document.getElementById('input-evidencia');
    const msgColocacoes = document.getElementById('msg-colocacoes');

    const status = document.getElementById('input-status').value;
    const isCorrida = jogoAtual.categoria === 'corrida';
    const isMultiEquipe = ehFaseProva(jogoAtual.fase) || isCorrida;

    let placarA = 0, placarB = 0, colocacoes = null, conclusoes = null;

    if (isMultiEquipe) {
        const resultado = coletarColocacoes();
        if (status === 'encerrado' && !resultado.valido) {
            msgColocacoes.style.display = 'block';
            return;
        }
        msgColocacoes.style.display = 'none';
        colocacoes = resultado.colocacoes;
        if (isCorrida) {
            conclusoes = coletarConclusoes();
        }
    } else {
        placarA = parseInt(document.getElementById('input-placar-a').value) || 0;
        placarB = parseInt(document.getElementById('input-placar-b').value) || 0;
    }

    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando Placar...';
    if (window.lucide) window.lucide.createIcons();

    let evidenciaUrl = jogoAtual.evidencia_url || null; // Mantem a antiga se houver
    
    // Se o usuário selecionou um arquivo novo, faz o upload
    if (fileInput.files && fileInput.files[0]) {
        btn.innerHTML = '<i data-lucide="upload-cloud" class="spin"></i> Enviando Evidência...';
        if (window.lucide) window.lucide.createIcons();
        
        const fileUrl = await uploadEvidencia(fileInput.files[0], jogoAtual.id);
        if (fileUrl) {
            evidenciaUrl = fileUrl;
        } else {
            msg.style.color = 'var(--color-warning)';
            msg.innerText = "Súmula sem evidência. Configure o Firebase Storage ou tente novamente.";
            // Prosseguirá o update mesmo sem o arquivo, para não travar o fluxo esportivo.
        }
    }

    const atualizacoes = {
        status: status,
        ...(isMultiEquipe ? { colocacoes } : { placar_a: placarA, placar_b: placarB }),
        ...(isCorrida && { conclusoes }),
        ...(evidenciaUrl && { evidencia_url: evidenciaUrl }) // Só injeta o campo se existir URL
    };

    const sucesso = await updateDocument('jogos', jogoAtual.id, atualizacoes);

    if (sucesso) {
        msg.style.color = 'var(--color-success)';
        msg.innerText = "Súmula oficializada com sucesso!";
        setTimeout(() => { window.history.back(); }, 1500);
    } else {
        msg.style.color = 'var(--color-danger)';
        msg.innerText = "Erro ao atualizar. Verifique sua permissão.";
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save"></i> Salvar Placar Oficial';
        if (window.lucide) window.lucide.createIcons();
    }
}
