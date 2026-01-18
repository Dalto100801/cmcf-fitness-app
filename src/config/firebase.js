import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ IMPORTANTE: REEMPLAZA ESTOS VALORES CON LOS DE TU NUEVO PROYECTO DE FIREBASE
// Ver GUIA_MASTER_DEPLOY.md para obtenerlos
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZQYoxr1jC6y7bLXpbovdPGBQFKaKWl7s",
  authDomain: "cmcf-fitness-v2.firebaseapp.com",
  projectId: "cmcf-fitness-v2",
  storageBucket: "cmcf-fitness-v2.firebasestorage.app",
  messagingSenderId: "316842630495",
  appId: "1:316842630495:web:16f55a36fe412eb415aaea"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ID interno de la App (No cambiar o se perderán datos viejos si se migra, 
// pero en proyecto nuevo esto empezará desde cero limpio)
export const appId = 'cmcf-fitness-v6';
