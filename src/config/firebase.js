import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBOPyMcI8pz1-pcyezWItEzDyIKcOs3r3U",
    authDomain: "cmfc-fitness-center.firebaseapp.com",
    projectId: "cmfc-fitness-center",
    storageBucket: "cmfc-fitness-center.firebasestorage.app",
    messagingSenderId: "608882705520",
    appId: "1:608882705520:web:528bb2273fe245287120b5",
    measurementId: "G-GQ1PKFEJF2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'cmcf-fitness-v6';
