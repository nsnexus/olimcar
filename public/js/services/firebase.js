// public/js/services/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Configuração oficial do projeto OLIMCAR
const firebaseConfig = {
    apiKey: "AIzaSyC2wQG0oijfm9iOERihqoXTrtOdZh7t7eM",
    authDomain: "olimcar-5f43e.firebaseapp.com",
    projectId: "olimcar-5f43e",
    storageBucket: "olimcar-5f43e.firebasestorage.app",
    messagingSenderId: "391040023220",
    appId: "1:391040023220:web:5a7b1b477801ebebc3f5e1",
    measurementId: "G-MQ8TYFWD3D"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Instâncias ativas
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
