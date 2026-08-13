import { getCollection, TABELA_PONTUACAO, CATEGORIAS_PONTUACAO } from '../services/db.js';

const CORES_EQUIPE = {
    "Equipe Azul": "var(--color-info)",
    "Equipe Vermelha": "var(--color-danger)",
    "Equipe Amarela": "var(--color-warning)",
    "Equipe Verde": "var(--color-success)"
};

function ehFinal(fase) {
    return (fase || '').trim().toUpperCase() === 'FINAL';
}

function ehTerceiroLugar(fase) {
    const f = (fase || '').trim().toUpperCase();
    return f.includes('3') && f.includes('LUGAR');
}

export function renderRankingPage() {
    setTimeout(loadRanking, 100);

    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 3rem;">
            <h2 style="margin-bottom: 0.5rem;">Quadro de Medalhas</h2>
            <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 700px;">
                Pontuação por colocação, conforme o regulamento oficial da Olimcar.
            </p>

            <div id="ranking-loading" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
                <i data-lucide="loader-2" class="spin" style="width: 32px; height: 32px;"></i>
                <p style="margin-top: 1rem;">Calculando pontuação...</p>
            </div>

            <div id="ranking-conteudo" style="display: none;">
                <div id="ranking-lista" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;"></div>
                <div id="ranking-aviso" class="card" style="padding: 1.25rem; background: var(--color-bg-body); font-size: 0.85rem; color: var(--color-text-muted); display: none;"></div>
            </div>
        </div>
    `;
}

async function loadRanking() {
    const loadingDiv = document.getElementById('ranking-loading');
    const conteudoDiv = document.getElementById('ranking-conteudo');
    const listaDiv = document.getElementById('ranking-lista');
    const avisoDiv = document.getElementById('ranking-aviso');

    if (!loadingDiv) return;

    try {
        const [jogos, equipesDB] = await Promise.all([
            getCollection('jogos'),
            getCollection('equipes')
        ]);

        const encerrados = jogos.filter(j => j.status === 'encerrado');

        const pontosPorEquipe = {};
        const medalhasPorEquipe = {};
        equipesDB.forEach(eq => {
            pontosPorEquipe[eq.nome] = 0;
            medalhasPorEquipe[eq.nome] = { 1: 0, 2: 0, 3: 0 };
        });

        let semCategoria = 0;
        let ignoradosPorFase = 0;

        const somarPonto = (equipe, categoria, posicao) => {
            if (!(equipe in pontosPorEquipe)) return;
            const pontos = TABELA_PONTUACAO[categoria]?.[posicao];
            if (pontos === undefined) return;
            pontosPorEquipe[equipe] += pontos;
            if (posicao <= 3) medalhasPorEquipe[equipe][posicao]++;
        };

        encerrados.forEach(jogo => {
            if (!jogo.categoria) { semCategoria++; return; }

            if (jogo.colocacoes && Object.keys(jogo.colocacoes).length > 0) {
                // Prova com todas as equipes de uma vez
                Object.entries(jogo.colocacoes).forEach(([equipe, posicao]) => {
                    somarPonto(equipe, jogo.categoria, posicao);
                });

                // Corrida: +1 ponto por atleta que concluiu, além da colocação
                if (jogo.categoria === 'corrida' && jogo.conclusoes) {
                    const pontoConclusao = TABELA_PONTUACAO.corrida.conclusao;
                    Object.entries(jogo.conclusoes).forEach(([equipe, qtd]) => {
                        if (equipe in pontosPorEquipe && qtd > 0) {
                            pontosPorEquipe[equipe] += qtd * pontoConclusao;
                        }
                    });
                }
                return;
            }

            // Confronto direto: só pontua em jogos de FINAL (ouro/prata) ou DISPUTA DE 3º LUGAR (bronze)
            const timeA = jogo.equipe_a?.nome;
            const timeB = jogo.equipe_b?.nome;
            const placarA = jogo.placar_a ?? 0;
            const placarB = jogo.placar_b ?? 0;

            if (placarA === placarB) { ignoradosPorFase++; return; } // Empate: sem colocação definível

            const vencedor = placarA > placarB ? timeA : timeB;
            const perdedor = placarA > placarB ? timeB : timeA;

            if (ehFinal(jogo.fase)) {
                somarPonto(vencedor, jogo.categoria, 1);
                somarPonto(perdedor, jogo.categoria, 2);
            } else if (ehTerceiroLugar(jogo.fase)) {
                somarPonto(vencedor, jogo.categoria, 3);
            } else {
                ignoradosPorFase++;
            }
        });

        const ranking = Object.entries(pontosPorEquipe).sort((a, b) => b[1] - a[1]);

        if (ranking.length === 0) {
            listaDiv.innerHTML = `<div class="card" style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
                Nenhuma equipe cadastrada ainda.
            </div>`;
        } else {
            const maxPontos = Math.max(1, ranking[0][1]);
            listaDiv.innerHTML = ranking.map(([equipe, pontos], i) => {
                const cor = CORES_EQUIPE[equipe] || 'var(--color-text-light)';
                const medalhas = medalhasPorEquipe[equipe];
                const largura = (pontos / maxPontos) * 100;
                return `
                <div class="card" style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; gap: 1rem; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 1.3rem; font-weight: 800; color: var(--color-text-light); width: 2rem;">${i + 1}º</span>
                            <span style="width: 14px; height: 14px; border-radius: 50%; background: ${cor}; display: inline-block; flex-shrink: 0;"></span>
                            <span style="font-weight: 700; font-size: 1.1rem;">${equipe.replace(/^Equipe\s+/i, '')}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">🥇 ${medalhas[1]} &nbsp; 🥈 ${medalhas[2]} &nbsp; 🥉 ${medalhas[3]}</span>
                            <span style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-700);">${pontos} pts</span>
                        </div>
                    </div>
                    <div style="background: var(--color-primary-50); border-radius: var(--radius-full); height: 10px; overflow: hidden;">
                        <div style="width: ${largura}%; height: 100%; background: ${cor}; border-radius: var(--radius-full); transition: width 0.8s ease;"></div>
                    </div>
                </div>
            `;
            }).join('');
        }

        const avisos = [];
        if (semCategoria > 0) avisos.push(`${semCategoria} jogo(s) encerrado(s) sem categoria de pontuação definida (edite em Agenda/Jogo para incluir).`);
        if (ignoradosPorFase > 0) avisos.push(`${ignoradosPorFase} confronto(s) fora de FINAL/3º Lugar (ou empatado) não geram pontos, só a colocação final pontua.`);

        if (avisos.length > 0) {
            avisoDiv.innerHTML = '⚠️ ' + avisos.join('<br>⚠️ ');
            avisoDiv.style.display = 'block';
        }

        loadingDiv.style.display = 'none';
        conteudoDiv.style.display = 'block';
        if (window.lucide) window.lucide.createIcons();

    } catch (e) {
        console.error(e);
        loadingDiv.innerHTML = '<p style="color: var(--color-danger);">Erro ao calcular o ranking.</p>';
    }
}
