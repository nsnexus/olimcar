// public/js/services/db.js
import { db, storage } from './firebase.js?v=20260912a';
import { collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Estrutura oficial de pontuação (Regulamento OLIMCAR)
export const TABELA_PONTUACAO = {
    'coletivo_plus': { 1: 50, 2: 35, 3: 20 }, // Acima de 4 atletas
    'coletivo':      { 1: 35, 2: 25, 3: 15 }, // Até 4 participantes
    'individual':    { 1: 25, 2: 15, 3: 10 },
    'recreativa':    { 1: 80, 2: 60, 3: 40, 4: 20 },
    'doacao':        { 1: 100, 2: 75, 3: 50, 4: 25 },
    'corrida':       { 1: 80, 2: 60, 3: 40, conclusao: 1 } // +1 p/ cada conclusão
};

export const CATEGORIAS_PONTUACAO = {
    'coletivo_plus': 'I – Esportes coletivos (acima de 4 atletas)',
    'coletivo':      'II – Esportes até 4 participantes',
    'individual':    'III – Esportes individuais',
    'recreativa':    'IV – Jogos da escola (recreativa)',
    'doacao':        'V – Doação',
    'corrida':       'VI – Corrida'
};

export function sortByDateAndTime(jogos) {
    const meses = { "janeiro":1, "fevereiro":2, "março":3, "abril":4, "maio":5, "junho":6, "julho":7, "agosto":8, "setembro":9, "outubro":10, "novembro":11, "dezembro":12 };
    
    function parseToTime(dataStr, horaStr) {
        if (!dataStr) return 0;
        const strLower = dataStr.toLowerCase();
        const p = strLower.split(' de ');
        if (p.length < 3) {
            // Tentativa fallback alfabético caso formato mude
            return dataStr.charCodeAt(0) * 1000000000;
        }
        
        const diaStr = p[0].includes(',') ? p[0].split(',')[1].trim() : p[0].trim();
        const dia = parseInt(diaStr) || 1;
        const mes = meses[p[1].trim()] || 1;
        const ano = parseInt(p[2].trim()) || 2026;
        
        let hora = 0, min = 0;
        if (horaStr && horaStr.includes(':')) {
            const hp = horaStr.split(':');
            hora = parseInt(hp[0]) || 0;
            min = parseInt(hp[1]) || 0;
        }
        return new Date(ano, mes-1, dia, hora, min).getTime();
    }

    return jogos.sort((a, b) => parseToTime(a.data_jogo, a.horario) - parseToTime(b.data_jogo, b.horario));
}

// Cache simples em memória (dura enquanto a aba estiver aberta) pra evitar
// reler a coleção inteira toda vez que o usuário troca de página. Escritas
// (addDocument/setDocument/updateDocument/deleteDocument) invalidam a
// entrada correspondente, então dados alterados aparecem atualizados no
// próximo getCollection daquela coleção.
const CACHE_TTL_MS = 60 * 1000;
const _cache = new Map(); // collectionName -> { data, ts }

function invalidarCache(collectionName) {
    _cache.delete(collectionName);
}

// Função genérica para pegar todos os documentos de uma coleção.
// Passe { force: true } pra ignorar o cache e forçar leitura do servidor.
export async function getCollection(collectionName, { force = false } = {}) {
    const cacheado = _cache.get(collectionName);
    if (!force && cacheado && (Date.now() - cacheado.ts) < CACHE_TTL_MS) {
        return [...cacheado.data];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const dados = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        _cache.set(collectionName, { data: dados, ts: Date.now() });
        return [...dados];
    } catch (error) {
        console.error(`Erro ao buscar coleção ${collectionName}:`, error);
        // Se a rede falhar mas ainda tivermos algo em cache (mesmo vencido), é melhor que nada.
        return cacheado ? [...cacheado.data] : [];
    }
}

// Conta os documentos de uma coleção sem baixar os documentos (1 leitura
// agregada em vez de N leituras). Use quando só precisar do número.
export async function getCollectionCount(collectionName) {
    try {
        const snap = await getCountFromServer(collection(db, collectionName));
        return snap.data().count;
    } catch (error) {
        console.error(`Erro ao contar coleção ${collectionName}:`, error);
        return null;
    }
}

// Normaliza texto pra busca: minúsculo, sem acento, espaços colapsados.
export function normalizarBusca(s) {
    return (s || '').toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ').trim();
}

// Busca colaboradores cujo nome_lower começa pelo prefixo dado (query no
// servidor, traz só os que batem — não a base inteira). O campo nome_lower
// é gravado na importação de inscrições.
export async function buscarColaboradoresPorNome(prefixo, max = 40) {
    const p = normalizarBusca(prefixo);
    if (p.length < 3) return [];
    try {
        const q = query(
            collection(db, 'colaboradores'),
            where('nome_lower', '>=', p),
            where('nome_lower', '<', p + ''),
            orderBy('nome_lower'),
            limit(max)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Erro na busca de colaboradores por nome:', error);
        return [];
    }
}

// Lista os inscritos de uma modalidade (query array-contains no servidor).
// Filtro por equipe é aplicado pelo chamador no cliente (conjunto já pequeno).
export async function buscarInscritosPorModalidade(modalidade, max = 300) {
    if (!modalidade) return [];
    try {
        const q = query(
            collection(db, 'colaboradores'),
            where('modalidades', 'array-contains', modalidade),
            limit(max)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Erro na busca de inscritos por modalidade:', error);
        return [];
    }
}

export async function getDocument(collectionName, id) {
    try {
        const docSnap = await getDoc(doc(db, collectionName, id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (e) {
        console.error(`Erro buscar doc ${id}:`, e);
        return null;
    }
}

export async function addDocument(collectionName, data) {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        invalidarCache(collectionName);
        return docRef.id;
    } catch (e) {
        console.error(`Erro adicionar doc em ${collectionName}:`, e);
        return null;
    }
}

export async function setDocument(collectionName, id, data) {
    try {
        await setDoc(doc(db, collectionName, id), data);
        invalidarCache(collectionName);
        return true;
    } catch (e) {
        console.error(`Erro ao setar doc ${id}:`, e);
        return false;
    }
}

export async function updateDocument(collectionName, id, data) {
    try {
        await updateDoc(doc(db, collectionName, id), data);
        invalidarCache(collectionName);
        return true;
    } catch (e) {
        console.error(`Erro atualizar doc ${id}:`, e);
        return false;
    }
}

export async function deleteDocument(collectionName, id) {
    try {
        await deleteDoc(doc(db, collectionName, id));
        invalidarCache(collectionName);
        return true;
    } catch (e) {
        console.error(`Erro ao deletar doc ${id}:`, e);
        return false;
    }
}

// Upload de arquivo para Storage
export async function uploadEvidencia(file, jogoId) {
    if (!file) return null;
    
    try {
        // Nome único para evitar cache e sobrescritas
        const uniqueName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `evidencias/${jogoId}/${uniqueName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.error('Erro no upload de evidência:', e);
        return null;
    }
}

// Upload de PDF de regulamento para Storage. Retorna { url, path } ou null.
export async function uploadRegulamento(file) {
    if (!file) return null;

    try {
        const uniqueName = `${Date.now()}_${file.name}`;
        const path = `regulamentos/${uniqueName}`;
        const storageRef = ref(storage, path);

        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return { url, path };
    } catch (e) {
        console.error('Erro no upload de regulamento:', e);
        return null;
    }
}

// Upload de vídeo pro Painel de TV. Cache longo (7 dias) pra não rebaixar
// o arquivo inteiro toda volta do loop na TV — só a 1ª exibição consome banda.
export async function uploadTvVideo(file) {
    if (!file) return null;

    try {
        const uniqueName = `${Date.now()}_${file.name}`;
        const path = `tv-videos/${uniqueName}`;
        const storageRef = ref(storage, path);

        const snapshot = await uploadBytes(storageRef, file, {
            contentType: file.type || 'video/mp4',
            cacheControl: 'public, max-age=604800'
        });
        const url = await getDownloadURL(snapshot.ref);
        return { url, path };
    } catch (e) {
        console.error('Erro no upload de vídeo da TV:', e);
        return null;
    }
}

// Remove um arquivo do Storage pelo caminho salvo no documento.
export async function deleteArquivoStorage(path) {
    if (!path) return true;
    try {
        await deleteObject(ref(storage, path));
        return true;
    } catch (e) {
        console.error('Erro ao remover arquivo do storage:', e);
        return false;
    }
}

// Função para popular dados básicos (Seed) caso o banco esteja vazio
export async function seedInitialData() {
    // 1. Criar Modalidades
    const modalidadesRef = collection(db, 'modalidades');
    const existingMods = await getDocs(modalidadesRef);
    
    if (existingMods.empty) {
        console.log("Semeando Modalidades...");
        const modalidades = [
            { nome: 'Atletismo', icone: 'atletismo.png', categoria_pontuacao: 'individual', min_jogadores: 1, max_jogadores: 1 },
            { nome: 'Basquete', icone: 'basquete.png', categoria_pontuacao: 'coletivo_plus', min_jogadores: 5, max_jogadores: 12 },
            { nome: 'Beach Tênis', icone: 'beach-tenis.png', categoria_pontuacao: 'coletivo', min_jogadores: 2, max_jogadores: 4 },
            { nome: 'Ciclismo', icone: 'ciclismo.png', categoria_pontuacao: 'individual', min_jogadores: 1, max_jogadores: 1 },
            { nome: 'Corrida de Rua', icone: 'corrida-de-rua.png', categoria_pontuacao: 'corrida', min_jogadores: 1, max_jogadores: 99 },
            { nome: 'Dama', icone: 'dama.png', categoria_pontuacao: 'recreativa', min_jogadores: 1, max_jogadores: 1 },
            { nome: 'Dominó', icone: 'domino.png', categoria_pontuacao: 'recreativa', min_jogadores: 2, max_jogadores: 2 },
            { nome: 'FIFA', icone: 'fifa.png', categoria_pontuacao: 'recreativa', min_jogadores: 1, max_jogadores: 2 },
            { nome: 'Futebol', icone: 'futebol.png', categoria_pontuacao: 'coletivo_plus', min_jogadores: 11, max_jogadores: 20 },
            { nome: 'Futsal', icone: 'futsal.png', categoria_pontuacao: 'coletivo_plus', min_jogadores: 5, max_jogadores: 12 },
            { nome: 'Handebol', icone: 'handebol.png', categoria_pontuacao: 'coletivo_plus', min_jogadores: 7, max_jogadores: 14 },
            { nome: 'Natação', icone: 'natacao.png', categoria_pontuacao: 'individual', min_jogadores: 1, max_jogadores: 1 },
            { nome: 'Peteca', icone: 'peteca.png', categoria_pontuacao: 'coletivo', min_jogadores: 2, max_jogadores: 4 },
            { nome: 'Sinuca', icone: 'sinuca.png', categoria_pontuacao: 'recreativa', min_jogadores: 1, max_jogadores: 2 },
            { nome: 'Tênis de Mesa', icone: 'tenis-de-mesa.png', categoria_pontuacao: 'individual', min_jogadores: 1, max_jogadores: 2 },
            { nome: 'Truco', icone: 'truco.png', categoria_pontuacao: 'recreativa', min_jogadores: 2, max_jogadores: 2 },
            { nome: 'Vôlei de Areia', icone: 'volei-de-areia.png', categoria_pontuacao: 'coletivo', min_jogadores: 2, max_jogadores: 4 },
            { nome: 'Vôlei de Quadra', icone: 'volei-de-quadra.png', categoria_pontuacao: 'coletivo_plus', min_jogadores: 6, max_jogadores: 12 },
            { nome: 'Xadrez', icone: 'xadrez.png', categoria_pontuacao: 'recreativa', min_jogadores: 1, max_jogadores: 1 }
        ];
        
        for (let mod of modalidades) {
            await addDoc(modalidadesRef, mod);
        }
    }
    
    // 2. Criar Equipes baseadas nas Cores do Excel
    const equipesRef = collection(db, 'equipes');
    const existingEquipes = await getDocs(equipesRef);
    
    if (existingEquipes.empty) {
        console.log("Semeando Equipes...");
        const equipes = [
            { nome: 'Equipe Azul', sigla: 'AZU', cor_primaria: '#3b82f6', cor_secundaria: '#fff' },
            { nome: 'Equipe Amarela', sigla: 'AMA', cor_primaria: '#eab308', cor_secundaria: '#000' },
            { nome: 'Equipe Verde', sigla: 'VER', cor_primaria: '#10b981', cor_secundaria: '#fff' },
            { nome: 'Equipe Vermelha', sigla: 'VRM', cor_primaria: '#ef4444', cor_secundaria: '#fff' }
        ];
        
        for (let eq of equipes) {
            await addDoc(equipesRef, eq);
        }
    }

    // 3. Importar Tabela de Jogos do CSV gerado
    const jogosRef = collection(db, 'jogos');
    const existingJogos = await getDocs(jogosRef);

    if (existingJogos.empty) {
        console.log("Baixando tabela de jogos (CSV)...");
        try {
            const response = await fetch('/assets/jogos.csv');
            const csvText = await response.text();
            
            // Mapas para resolver IDs
            const equipesSnap = await getDocs(equipesRef);
            const mapEquipes = {};
            equipesSnap.forEach(doc => {
                let nomeCor = doc.data().nome.split(' ')[1].toUpperCase();
                mapEquipes[nomeCor] = { id: doc.id, nome: doc.data().nome };
            }); // Ex: mapEquipes['AZUL'] = { id: '...', nome: 'Equipe Azul' }
            
            // Mapeamento "AZUL" -> "AZUL", "AMARELO" -> "AMARELA", "VERMELHO" -> "VERMELHA"
            // (Para coincidir com o nomeCor salvo acima ou simplificar as strings do Excel)
            const resolverEquipe = (corText) => {
                if(!corText) return null;
                const c = corText.trim().toUpperCase();
                if(c === 'AZUL') return mapEquipes['AZUL'];
                if(c === 'AMARELO') return mapEquipes['AMARELA'];
                if(c === 'VERDE') return mapEquipes['VERDE'];
                if(c === 'VERMELHO') return mapEquipes['VERMELHA'];
                return null;
            };

            const linhas = csvText.split('\n');
            let dataAtual = "Data Não Definida";
            
            for (let i = 0; i < linhas.length; i++) {
                const colunas = linhas[i].split(';');
                if (colunas.length < 5) continue; // Linha inválida ou muito curta
                
                // Tratar a data herdada
                if (colunas[0] && colunas[0].trim() !== '') {
                    dataAtual = colunas[0].trim();
                }
                
                const horario = colunas[1] ? colunas[1].trim() : '';
                const modalidade = colunas[2] ? colunas[2].trim() : '';
                const local = colunas[3] ? colunas[3].trim() : '';
                const fase = colunas[4] ? colunas[4].trim() : '';
                const timeA_nome = colunas[5] ? colunas[5].trim() : '';
                const timeB_nome = colunas[7] ? colunas[7].trim() : ''; // col 6 é o 'X'
                
                if (!modalidade) continue;

                // Salvar o Jogo
                const jogoDoc = {
                    data_jogo: dataAtual,
                    horario: horario,
                    modalidade_texto: modalidade, // Como as modalidades no CSV são específicas demais (ex: NATAÇÃO 25 m RASOS FEMININO), usaremos texto livre e criaremos Modalidade_ID mais tarde ou associamos.
                    local: local,
                    fase: fase,
                    equipe_a: resolverEquipe(timeA_nome) || { nome: timeA_nome },
                    equipe_b: resolverEquipe(timeB_nome) || { nome: timeB_nome },
                    placar_a: 0,
                    placar_b: 0,
                    status: 'agendado',
                    criado_em: new Date().toISOString()
                };
                
                await addDoc(jogosRef, jogoDoc);
            }
            console.log("Jogos importados com sucesso!");
        } catch (e) {
            console.error("Falha ao importar jogos:", e);
        }
    }
    
    console.log("Seed de Jogos e Equipes finalizado (ou já existia)!");
}

// Inicializador Automático de Usuários (Roda sem precisar clicar em nada)
setTimeout(async () => {
    try {
        const acessos = [
            { id: 'time_azul@olimcar.com.br', role: 'lider', equipeId: 'Equipe Azul' },
            { id: 'time_amarelo@olimcar.com.br', role: 'lider', equipeId: 'Equipe Amarela' },
            { id: 'time_verde@olimcar.com.br', role: 'lider', equipeId: 'Equipe Verde' },
            { id: 'time_vermelho@olimcar.com.br', role: 'lider', equipeId: 'Equipe Vermelha' },
            { id: '01P8mEIXC0Xw24aQJs7wSEybXom1', role: 'admin', equipeId: 'Admin Master' }, // ID Exigido pelo Usuário
            { id: 'jfFPhcTj5icb039OWkePCXHjtmw2', role: 'arbitro', equipeId: 'Arbitragem' }
        ];

        for (let u of acessos) {
            const existente = await getDoc(doc(db, 'usuarios', u.id));
            if (!existente.exists()) {
                console.log(`Auto-semeando acesso: ${u.id} (${u.role})`);
                await setDoc(doc(db, 'usuarios', u.id), u);
            }
        }
    } catch (error) {
        console.error("Erro no auto-seed de usuários:", error);
    }
}, 1500);
