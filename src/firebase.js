// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc, limit, startAfter } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "XXXXXXXXXXXXXXXXXX",
    authDomain: "XXXXXXXXXXXXXXXXXX",
    projectId: "XXXXXXXXXXXXXXXXXX",
    storageBucket: "XXXXXXXXXXXXXXXXXX",
    messagingSenderId: "XXXXXXXXXXXXXXXXXX",
    appId: "XXXXXXXXXXXXXXXXXX",
    measurementId: "XXXXXXXXXXXXXXXXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export {
    db,
    auth,
    provider,
    collection,
    getDocs,
    addDoc,
    limit,
    startAfter,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDoc,
    setDoc
};
