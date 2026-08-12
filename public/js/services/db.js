// public/js/services/db.js
import { db } from './firebase.js';
import { collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Estrutura oficial de pontuação (Regulamento OLIMCAR)
export const TABELA_PONTUACAO = {
    'coletivo_plus': { 1: 50, 2: 35, 3: 20 }, // Acima de 4 atletas
    'coletivo':      { 1: 35, 2: 25, 3: 15 }, // Até 4 participantes
    'individual':    { 1: 25, 2: 15, 3: 10 },
    'recreativa':    { 1: 80, 2: 60, 3: 40, 4: 20 },
    'doacao':        { 1: 100, 2: 75, 3: 50, 4: 25 },
    'corrida':       { 1: 80, 2: 60, 3: 40, conclusao: 1 } // +1 p/ cada conclusão
};

// Função genérica para pegar todos os documentos de uma coleção
export async function getCollection(collectionName) {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Erro ao buscar coleção ${collectionName}:`, error);
        return [];
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
            { nome: 'Futebol Society', icone: '⚽', categoria_pontuacao: 'coletivo_plus', min_jogadores: 7, max_jogadores: 12 },
            { nome: 'Voleibol', icone: '🏐', categoria_pontuacao: 'coletivo_plus', min_jogadores: 6, max_jogadores: 12 },
            { nome: 'Tênis de Dupla', icone: '🎾', categoria_pontuacao: 'coletivo', min_jogadores: 2, max_jogadores: 4 },
            { nome: 'Natação', icone: '🏊', categoria_pontuacao: 'individual', min_jogadores: 1, max_jogadores: 1 },
            { nome: 'Jogos de Abertura', icone: '🎉', categoria_pontuacao: 'recreativa', min_jogadores: 1, max_jogadores: 99 },
            { nome: 'Arrecadação', icone: '🥫', categoria_pontuacao: 'doacao', min_jogadores: 1, max_jogadores: 99 },
            { nome: 'Corrida Rústica', icone: '🏃', categoria_pontuacao: 'corrida', min_jogadores: 1, max_jogadores: 99 }
        ];
        
        for (let mod of modalidades) {
            await addDoc(modalidadesRef, mod);
        }
    }
    
    // 2. Criar Equipes
    const equipesRef = collection(db, 'equipes');
    const existingEquipes = await getDocs(equipesRef);
    
    if (existingEquipes.empty) {
        console.log("Semeando Equipes...");
        const equipes = [
            { nome: 'Tigres do Vale', sigla: 'TIG', cor_primaria: '#f59e0b', cor_secundaria: '#000' },
            { nome: 'Leões Dourados', sigla: 'LEO', cor_primaria: '#eab308', cor_secundaria: '#fff' },
            { nome: 'Dragões de Fogo', sigla: 'DRA', cor_primaria: '#ef4444', cor_secundaria: '#1f2937' },
            { nome: 'Águias Livres', sigla: 'AGU', cor_primaria: '#3b82f6', cor_secundaria: '#fff' }
        ];
        
        for (let eq of equipes) {
            await addDoc(equipesRef, eq);
        }
    }
    
    console.log("Seed finalizado (ou já existia)!");
}
