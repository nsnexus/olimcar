// public/js/pages/admin/jogo_editor.js
import { getDocument, updateDocument } from '../../services/db.js';

let jogoAtual = null;

export function renderJogoEditorPage() {
    // Retira id da query params se possível, mas como nosso app usa hash routing sem query parser decente,
    // extraimos com URLSearchParams da parte apos a interrogação.
    setTimeout(loadJogoData, 50);

    return `
        <div class="container" style="padding-top: 2rem; max-width: 800px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Editar Súmula do Jogo</h2>
                <button class="btn btn-outline" onclick="window.history.back()"><i data-lucide="arrow-left"></i> Voltar</button>
            </div>
            
            <div id="editor-loading" style="text-align: center; padding: 4rem;">
                <i data-lucide="loader-2" class="spin"></i> Buscando partida...
            </div>
            
            <div id="editor-content" style="display: none;">
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header" style="display: flex; justify-content: space-between;">
                        <span>Informações da Partida</span>
                        <span id="badge-status" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background: var(--color-bg-body); border-radius: 4px;"></span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label class="form-label">Modalidade</label>
                            <div style="font-weight: 500;" id="lbl-modalidade">-</div>
                        </div>
                        <div>
                            <label class="form-label">Data e Hora</label>
                            <div style="font-weight: 500;" id="lbl-data">-</div>
                        </div>
                        <div>
                            <label class="form-label">Local</label>
                            <div style="font-weight: 500;" id="lbl-local">-</div>
                        </div>
                        <div>
                            <label class="form-label">Fase</label>
                            <div style="font-weight: 500;" id="lbl-fase">-</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Súmula / Placar Oficial</div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
                        <div style="flex: 1; text-align: right;">
                            <h3 id="lbl-equipe-a" style="margin-bottom: 0.5rem;">Equipe A</h3>
                            <input type="number" id="input-placar-a" class="form-control" style="width: 80px; text-align: center; font-size: 1.5rem; font-weight: bold; margin-left: auto;" min="0">
                        </div>
                        
                        <div style="font-size: 1.5rem; color: var(--color-text-muted); font-weight: bold;">X</div>
                        
                        <div style="flex: 1;">
                            <h3 id="lbl-equipe-b" style="margin-bottom: 0.5rem;">Equipe B</h3>
                            <input type="number" id="input-placar-b" class="form-control" style="width: 80px; text-align: center; font-size: 1.5rem; font-weight: bold;" min="0">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Status da Partida</label>
                        <select id="input-status" class="form-control">
                            <option value="agendado">Agendado</option>
                            <option value="andamento">Em Andamento</option>
                            <option value="encerrado">Encerrado (Finalizado)</option>
                        </select>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
                        <button class="btn btn-primary" id="btn-salvar-sumula">
                            <i data-lucide="save"></i> Salvar Súmula Oficial
                        </button>
                    </div>
                    <p id="msg-feedback" style="text-align: right; margin-top: 1rem; font-size: 0.9rem;"></p>
                </div>
            </div>
        </div>
    `;
}

async function loadJogoData() {
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

    // Preencher Tela
    document.getElementById('lbl-modalidade').innerText = jogoAtual.modalidade_texto || '-';
    document.getElementById('lbl-data').innerText = (jogoAtual.data_jogo || '-') + ' às ' + (jogoAtual.horario || '-');
    document.getElementById('lbl-local').innerText = jogoAtual.local || '-';
    document.getElementById('lbl-fase').innerText = jogoAtual.fase || '-';

    document.getElementById('lbl-equipe-a').innerText = jogoAtual.equipe_a?.nome || 'A Definir';
    document.getElementById('lbl-equipe-b').innerText = jogoAtual.equipe_b?.nome || 'A Definir';
    
    document.getElementById('input-placar-a').value = jogoAtual.placar_a || 0;
    document.getElementById('input-placar-b').value = jogoAtual.placar_b || 0;
    
    document.getElementById('input-status').value = jogoAtual.status || 'agendado';
    
    const badgeMap = { 'agendado': '⏳ Agendado', 'andamento': '🔥 Em andamento', 'encerrado': '✅ Encerrado' };
    document.getElementById('badge-status').innerText = badgeMap[jogoAtual.status || 'agendado'];

    document.getElementById('editor-loading').style.display = 'none';
    document.getElementById('editor-content').style.display = 'block';

    document.getElementById('btn-salvar-sumula').addEventListener('click', salvarSumula);
    if (window.lucide) window.lucide.createIcons();
}

async function salvarSumula() {
    const btn = document.getElementById('btn-salvar-sumula');
    const msg = document.getElementById('msg-feedback');
    
    const placarA = parseInt(document.getElementById('input-placar-a').value) || 0;
    const placarB = parseInt(document.getElementById('input-placar-b').value) || 0;
    const status = document.getElementById('input-status').value;

    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando...';
    if (window.lucide) window.lucide.createIcons();

    const atualizacoes = {
        placar_a: placarA,
        placar_b: placarB,
        status: status
    };

    const sucesso = await updateDocument('jogos', jogoAtual.id, atualizacoes);

    if (sucesso) {
        msg.style.color = 'var(--color-success)';
        msg.innerText = "Súmula atualizada com sucesso!";
        setTimeout(() => { window.history.back(); }, 1500);
    } else {
        msg.style.color = 'var(--color-danger)';
        msg.innerText = "Erro ao atualizar. Verifique sua permissão.";
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save"></i> Salvar Súmula Oficial';
        if (window.lucide) window.lucide.createIcons();
    }
}
