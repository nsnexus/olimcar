import { getCollection, getTabelaPontuacao, TABELA_PONTUACAO, CATEGORIAS_PONTUACAO } from '../services/db.js?v=20260917b';

const CORES_EQUIPE = {
    "Equipe Azul": "var(--color-info)",
    "Equipe Vermelha": "var(--color-danger)",
    "Equipe Amarela": "var(--color-warning)",
    "Equipe Verde": "var(--color-success)"
};

export function ehFinal(fase) {
    return (fase || '').trim().toUpperCase() === 'FINAL';
}

export function ehTerceiroLugar(fase) {
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

// Calcula pontuação e medalhas por equipe a partir dos jogos encerrados.
// Reaproveitado pela página de Ranking e pelo Painel de TV. `tabelaPontuacao`
// é opcional (default = tabela fixa do código) — passe o resultado de
// getTabelaPontuacao() pra usar os valores editados em admin/pontuacao.js.
export function calcularRanking(jogos, equipesDB, tabelaPontuacao = TABELA_PONTUACAO) {
    const encerrados = jogos.filter(j => j.status === 'encerrado');

    const pontosPorEquipe = {};
    const medalhasPorEquipe = {};
    equipesDB.forEach(eq => {
        pontosPorEquipe[eq.nome] = 0;
        medalhasPorEquipe[eq.nome] = { 1: 0, 2: 0, 3: 0, 4: 0 };
    });

    let semCategoria = 0;
    let ignoradosPorFase = 0;

    const somarPonto = (equipe, categoria, posicao) => {
        if (!(equipe in pontosPorEquipe)) return;
        const pontos = tabelaPontuacao[categoria]?.[posicao];
        if (pontos === undefined) return;
        pontosPorEquipe[equipe] += pontos;
        if (posicao <= 4) medalhasPorEquipe[equipe][posicao]++;
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
                const pontoConclusao = tabelaPontuacao.corrida.conclusao;
                Object.entries(jogo.conclusoes).forEach(([equipe, qtd]) => {
                    if (equipe in pontosPorEquipe && qtd > 0) {
                        pontosPorEquipe[equipe] += qtd * pontoConclusao;
                    }
                });
            }

            // Doação: bônus fixo à parte da colocação pra quem bateu a meta
            // de kg arrecadado (Art. 24, V) — independe de ser 1º ou 4º lugar.
            if (jogo.categoria === 'doacao' && jogo.kg_arrecadado) {
                const { meta_kg, bonus_meta } = tabelaPontuacao.doacao;
                Object.entries(jogo.kg_arrecadado).forEach(([equipe, kg]) => {
                    if (equipe in pontosPorEquipe && kg >= meta_kg) {
                        pontosPorEquipe[equipe] += bonus_meta;
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
    const avisos = [];
    if (semCategoria > 0) avisos.push(`${semCategoria} jogo(s) encerrado(s) sem categoria de pontuação definida (edite em Agenda/Jogo para incluir).`);
    if (ignoradosPorFase > 0) avisos.push(`${ignoradosPorFase} confronto(s) fora de FINAL/3º Lugar (ou empatado) não geram pontos, só a colocação final pontua.`);

    return { ranking, medalhasPorEquipe, avisos };
}

// Extrato linha-a-linha (1 jogo/prova encerrado = 1 linha) do que virou
// pontuação e do que ficou de fora, pra conferência em admin/pontuacao.js —
// mesma regra de cálculo do calcularRanking acima, só que explicando cada
// caso em vez de só somar.
export function gerarExtratoPontuacao(jogos, equipesDB, tabelaPontuacao = TABELA_PONTUACAO) {
    const nomesEquipes = new Set(equipesDB.map(eq => eq.nome));
    const encerrados = jogos.filter(j => j.status === 'encerrado');

    const pontosDe = (categoria, posicao) => tabelaPontuacao[categoria]?.[posicao];

    return encerrados.map(jogo => {
        const linha = {
            id: jogo.id,
            modalidade: jogo.modalidade_texto || '(sem modalidade)',
            fase: jogo.fase || '-',
            categoria: jogo.categoria || null,
            categoriaLabel: jogo.categoria ? (CATEGORIAS_PONTUACAO[jogo.categoria] || jogo.categoria) : null,
            colocacoes: [],
            aviso: null
        };

        if (!jogo.categoria) {
            linha.aviso = 'Sem categoria de pontuação definida — não pontua.';
            return linha;
        }

        if (jogo.colocacoes && Object.keys(jogo.colocacoes).length > 0) {
            linha.colocacoes = Object.entries(jogo.colocacoes)
                .filter(([equipe]) => nomesEquipes.has(equipe))
                .map(([equipe, posicao]) => ({ posicao, equipe, pontos: pontosDe(jogo.categoria, posicao) ?? 0 }))
                .sort((a, b) => a.posicao - b.posicao);

            if (jogo.categoria === 'corrida' && jogo.conclusoes) {
                const pontoConclusao = tabelaPontuacao.corrida.conclusao;
                Object.entries(jogo.conclusoes).forEach(([equipe, qtd]) => {
                    if (qtd > 0) {
                        const existente = linha.colocacoes.find(c => c.equipe === equipe);
                        const bonus = qtd * pontoConclusao;
                        if (existente) existente.pontos += bonus;
                        else linha.colocacoes.push({ posicao: null, equipe, pontos: bonus, obs: `+${bonus}pt por conclusão` });
                    }
                });
            }

            if (jogo.categoria === 'doacao' && jogo.kg_arrecadado) {
                const { meta_kg, bonus_meta } = tabelaPontuacao.doacao;
                Object.entries(jogo.kg_arrecadado).forEach(([equipe, kg]) => {
                    if (kg >= meta_kg) {
                        const existente = linha.colocacoes.find(c => c.equipe === equipe);
                        if (existente) existente.pontos += bonus_meta;
                        else linha.colocacoes.push({ posicao: null, equipe, pontos: bonus_meta, obs: `bateu meta de ${meta_kg}kg` });
                    }
                });
            }
            return linha;
        }

        const timeA = jogo.equipe_a?.nome;
        const timeB = jogo.equipe_b?.nome;
        const placarA = jogo.placar_a ?? 0;
        const placarB = jogo.placar_b ?? 0;

        if (placarA === placarB) {
            linha.aviso = 'Empate — sem colocação definível, não pontua.';
            return linha;
        }

        const vencedor = placarA > placarB ? timeA : timeB;
        const perdedor = placarA > placarB ? timeB : timeA;

        if (ehFinal(jogo.fase)) {
            linha.colocacoes = [
                { posicao: 1, equipe: vencedor, pontos: pontosDe(jogo.categoria, 1) ?? 0 },
                { posicao: 2, equipe: perdedor, pontos: pontosDe(jogo.categoria, 2) ?? 0 }
            ];
        } else if (ehTerceiroLugar(jogo.fase)) {
            linha.colocacoes = [{ posicao: 3, equipe: vencedor, pontos: pontosDe(jogo.categoria, 3) ?? 0 }];
        } else {
            linha.aviso = 'Fora de FINAL/3º Lugar — não pontua (só o resultado final da chave pontua).';
        }

        return linha;
    });
}

async function loadRanking() {
    const loadingDiv = document.getElementById('ranking-loading');
    const conteudoDiv = document.getElementById('ranking-conteudo');
    const listaDiv = document.getElementById('ranking-lista');
    const avisoDiv = document.getElementById('ranking-aviso');

    if (!loadingDiv) return;

    try {
        const [jogos, equipesDB, tabelaPontuacao] = await Promise.all([
            getCollection('jogos'),
            getCollection('equipes'),
            getTabelaPontuacao()
        ]);

        const { ranking, medalhasPorEquipe, avisos } = calcularRanking(jogos, equipesDB, tabelaPontuacao);
        const extrato = gerarExtratoPontuacao(jogos, equipesDB, tabelaPontuacao);

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
                const position = i + 1;
                const rankClass = position <= 3 ? `rank-${position}` : '';
                const idSeguro = equipe.replace(/\s+/g, '-');

                const linhasEquipe = extrato
                    .flatMap(l => l.colocacoes.filter(c => c.equipe === equipe).map(c => ({ ...c, modalidade: l.modalidade, fase: l.fase })))
                    .sort((a, b) => (a.posicao ?? 99) - (b.posicao ?? 99));

                const detalheHTML = linhasEquipe.length > 0
                    ? linhasEquipe.map(l => `
                        <div style="display:flex; align-items:center; gap:0.6rem; padding:0.5rem 0; border-bottom:1px solid var(--color-border); font-size:0.88rem;">
                            <strong style="min-width:2em; color:${cor};">${l.posicao ? l.posicao + 'º' : '+'}</strong>
                            <span style="flex:1; min-width:0;">${l.modalidade}<span style="color:var(--color-text-muted);"> · ${l.fase}</span></span>
                            <strong style="color:var(--color-primary-600);">+${l.pontos}pt</strong>
                        </div>
                    `).join('')
                    : `<p style="color:var(--color-text-muted); font-size:0.88rem; padding:0.5rem 0;">Nenhum ponto ainda.</p>`;

                return `
                <div class="ranking-card ${rankClass}" style="animation-delay: ${i * 0.1}s">
                    <div class="ranking-header">
                        <div class="ranking-team-info">
                            <div class="rank-badge">${position}º</div>
                            <span class="team-color-dot" style="background: ${cor};"></span>
                            <span class="team-name">${equipe.replace(/^Equipe\s+/i, '')}</span>
                        </div>

                        <div class="ranking-stats">
                            <div class="medals-container">
                                <div class="medal-badge medal-gold"><i data-lucide="medal"></i> ${medalhas[1]}</div>
                                <div class="medal-badge medal-silver"><i data-lucide="medal"></i> ${medalhas[2]}</div>
                                <div class="medal-badge medal-bronze"><i data-lucide="medal"></i> ${medalhas[3]}</div>
                                <div class="medal-badge medal-fourth" title="4º lugar">4º ${medalhas[4]}</div>
                            </div>
                            <div class="ranking-points">${pontos} <span style="font-size: 0.9rem; font-weight:600; color:var(--color-text-muted)">pts</span></div>
                        </div>
                    </div>

                    <div class="ranking-progress-bg">
                        <div class="ranking-progress-fill" style="width: ${largura}%; background: ${cor};"></div>
                    </div>

                    <button type="button" class="btn btn-outline btn-detalhe-ranking" data-alvo="detalhe-${idSeguro}" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.45rem 0.9rem;">
                        <i data-lucide="chevron-down"></i> Ver detalhamento
                    </button>
                    <div id="detalhe-${idSeguro}" style="display:none; margin-top: 0.75rem;">
                        ${detalheHTML}
                    </div>
                </div>
                `;
            }).join('');

            listaDiv.querySelectorAll('.btn-detalhe-ranking').forEach(btn => {
                btn.addEventListener('click', () => {
                    const alvo = document.getElementById(btn.dataset.alvo);
                    const aberto = alvo.style.display !== 'none';
                    alvo.style.display = aberto ? 'none' : 'block';
                    btn.innerHTML = aberto
                        ? '<i data-lucide="chevron-down"></i> Ver detalhamento'
                        : '<i data-lucide="chevron-up"></i> Esconder detalhamento';
                    if (window.lucide) window.lucide.createIcons();
                });
            });
        }

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
