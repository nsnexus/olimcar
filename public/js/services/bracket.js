// public/js/services/bracket.js — Avanço automático de chave eliminatória
// (Semifinal -> Final/3º Lugar) para modalidades de confronto direto
// (futebol, futsal, handebol, vôlei etc).
//
// Como os jogos são cadastrados hoje (ver jogo_editor.js / CSV de origem):
// cada chave é um grupo de até 4 jogos com o MESMO modalidade_texto —
// NÃO necessariamente a mesma data_jogo (ex: semifinal no dia 19 e final só
// no dia 26) — diferenciados só pelo campo livre `fase`:
//   "JOGO 01"  — semifinal 1 (2 equipes já definidas)
//   "JOGO 02"  — semifinal 2 (2 equipes já definidas)
//   "FINAL"    — equipe_a/equipe_b = "A Definir" até as semis fecharem
//   "3º LUGAR" — idem
//
// Regra de avanço (fixa, não depende de qual time ganhou em qual jogo):
//   vencedor/perdedor do JOGO 01 -> sempre cai no slot `equipe_a` da
//   FINAL/3º LUGAR; vencedor/perdedor do JOGO 02 -> sempre `equipe_b`.
// Isso torna a operação idempotente: reabrir e corrigir o placar de uma
// semifinal só resobrescreve o MESMO slot, nunca duplica nem embaralha.
import { getCollection, updateDocument } from './db.js?v=20260917b';
import { ehFinal, ehTerceiroLugar } from '../pages/ranking.js?v=20260917b';

function normFase(fase) {
    return (fase || '').trim().toUpperCase();
}

function ehSemifinal1(fase) { return normFase(fase) === 'JOGO 01'; }
function ehSemifinal2(fase) { return normFase(fase) === 'JOGO 02'; }

// Chama depois de salvar a súmula de um jogo. Só faz algo se `jogo` for uma
// semifinal (JOGO 01/02), encerrada, com um vencedor claro (sem empate) e
// as duas equipes já definidas. Fora isso, não faz nada (retorna null).
export async function avancarChaveEliminatoria(jogo) {
    const fase = jogo.fase;
    if (!ehSemifinal1(fase) && !ehSemifinal2(fase)) return null;
    if (jogo.status !== 'encerrado') return null;

    const placarA = jogo.placar_a ?? 0;
    const placarB = jogo.placar_b ?? 0;
    if (placarA === placarB) return null; // empate: sem vencedor pra avançar

    const timeA = jogo.equipe_a?.nome;
    const timeB = jogo.equipe_b?.nome;
    if (!timeA || !timeB || timeA === 'A Definir' || timeB === 'A Definir') return null;

    const vencedor = placarA > placarB ? timeA : timeB;
    const perdedor = placarA > placarB ? timeB : timeA;
    const slot = ehSemifinal1(fase) ? 'equipe_a' : 'equipe_b';

    const todosJogos = await getCollection('jogos', { force: true });
    const irmaos = todosJogos.filter(j =>
        j.id !== jogo.id &&
        j.modalidade_texto === jogo.modalidade_texto
    );

    const final = irmaos.find(j => ehFinal(j.fase));
    const terceiroLugar = irmaos.find(j => ehTerceiroLugar(j.fase));

    const tarefas = [];
    if (final) tarefas.push(updateDocument('jogos', final.id, { [slot]: { nome: vencedor } }));
    if (terceiroLugar) tarefas.push(updateDocument('jogos', terceiroLugar.id, { [slot]: { nome: perdedor } }));
    if (tarefas.length === 0) return null;

    await Promise.all(tarefas);
    return { vencedor, perdedor, avancouFinal: !!final, avancouTerceiroLugar: !!terceiroLugar };
}
