// public/js/pages/admin/jogo_editor.js
import { getDocument, updateDocument } from '../../services/db.js';

let jogoAtual = null;

export function renderJogoEditorPage() {
    setTimeout(loadJogoData, 50);

    return `
        <div class="container" style="padding-top: 2rem; max-width: 800px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Editar Informações do Jogo</h2>
                <button class="btn btn-outline" onclick="window.history.back()"><i data-lucide="arrow-left"></i> Voltar</button>
            </div>
            
            <div id="editor-loading" style="text-align: center; padding: 4rem;">
                <i data-lucide="loader-2" class="spin"></i> Buscando partida...
            </div>
            
            <div id="editor-content" style="display: none;">
                <div class="card" style="margin-bottom: 2rem;">
                    <div class="card-header">Dados da Agenda e Local</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Modalidade</label>
                            <input type="text" id="input-modalidade" class="form-control" placeholder="Ex: Futebol Society">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Data do Jogo</label>
                            <input type="text" id="input-data" class="form-control" placeholder="Ex: 19 de setembro">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Horário</label>
                            <input type="time" id="input-horario" class="form-control">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Local / Quadra</label>
                            <input type="text" id="input-local" class="form-control" placeholder="Ex: Campo A">
                        </div>
                        <div class="form-group" style="grid-column: span 2;">
                            <label class="form-label">Fase (Opcional)</label>
                            <input type="text" id="input-fase" class="form-control" placeholder="Ex: Semifinal, JOGO 01">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">Confronto (Equipes)</div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary-600);">Equipe A</label>
                            <input type="text" id="input-equipe-a" class="form-control" placeholder="Ex: Equipe Amarela">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary-600);">Equipe B</label>
                            <input type="text" id="input-equipe-b" class="form-control" placeholder="Ex: Equipe Verde">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; border-top: 1px solid var(--color-border); padding-top: 1.5rem;">
                        <button class="btn btn-primary" id="btn-salvar-jogo">
                            <i data-lucide="save"></i> Salvar Alterações da Agenda
                        </button>
                    </div>
                    <p id="msg-feedback" style="text-align: right; margin-top: 1rem; font-size: 0.95rem; font-weight: 500;"></p>
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

    // Preencher Inputs de Edição
    document.getElementById('input-modalidade').value = jogoAtual.modalidade_texto || '';
    document.getElementById('input-data').value = jogoAtual.data_jogo || '';
    document.getElementById('input-horario').value = jogoAtual.horario || '';
    document.getElementById('input-local').value = jogoAtual.local || '';
    document.getElementById('input-fase').value = jogoAtual.fase || '';
    
    document.getElementById('input-equipe-a').value = jogoAtual.equipe_a?.nome || '';
    document.getElementById('input-equipe-b').value = jogoAtual.equipe_b?.nome || '';

    document.getElementById('editor-loading').style.display = 'none';
    document.getElementById('editor-content').style.display = 'block';

    document.getElementById('btn-salvar-jogo').addEventListener('click', salvarJogoInfo);
    if (window.lucide) window.lucide.createIcons();
}

async function salvarJogoInfo() {
    const btn = document.getElementById('btn-salvar-jogo');
    const msg = document.getElementById('msg-feedback');
    
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Salvando Agenda...';
    if (window.lucide) window.lucide.createIcons();

    const atualizacoes = {
        modalidade_texto: document.getElementById('input-modalidade').value,
        data_jogo: document.getElementById('input-data').value,
        horario: document.getElementById('input-horario').value,
        local: document.getElementById('input-local').value,
        fase: document.getElementById('input-fase').value,
        equipe_a: { nome: document.getElementById('input-equipe-a').value },
        equipe_b: { nome: document.getElementById('input-equipe-b').value }
    };

    const sucesso = await updateDocument('jogos', jogoAtual.id, atualizacoes);

    if (sucesso) {
        msg.style.color = 'var(--color-success)';
        msg.innerText = "Informações atualizadas com sucesso!";
        setTimeout(() => { window.history.back(); }, 1500);
    } else {
        msg.style.color = 'var(--color-danger)';
        msg.innerText = "Erro ao atualizar. Verifique sua permissão.";
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save"></i> Salvar Alterações da Agenda';
        if (window.lucide) window.lucide.createIcons();
    }
}
