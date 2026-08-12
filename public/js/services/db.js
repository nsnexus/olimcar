// public/js/services/db.js
import { db } from './firebase.js';
import { collection, doc, setDoc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
            { nome: 'Futebol Society', icone: '⚽', tipo: 'coletivo', min_jogadores: 7, max_jogadores: 12 },
            { nome: 'Voleibol', icone: '🏐', tipo: 'coletivo', min_jogadores: 6, max_jogadores: 12 },
            { nome: 'Basquetebol', icone: '🏀', tipo: 'coletivo', min_jogadores: 5, max_jogadores: 10 }
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
