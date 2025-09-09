// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  authDomain: "grand-medical-website.firebaseapp.com",
  projectId: "grand-medical-website",
  storageBucket: "grand-medical-website.appspot.com",
  messagingSenderId: "799272313892",
  appId: "1:799272313892:web:6dd4ee226cb9e791e524b1",
  measurementId: "G-HK1ZM18JET"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };