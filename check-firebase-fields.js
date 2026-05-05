const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, limit, query } = require("firebase/firestore");

// !!! PASTE YOUR FIREBASE CONFIG HERE !!!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  authDomain: "grand-medical-website.firebaseapp.com",
  projectId: "grand-medical-website",
  storageBucket: "grand-medical-website.appspot.com",
  messagingSenderId: "799272313892",
  appId: "1:799272313892:web:6dd4ee226cb9e791e524b1",
  measurementId: "G-HK1ZM18JET"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFields() {
    console.log("Fetching ONE item to check field names...");
    const productsRef = collection(db, "products");
    const q = query(productsRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("Database is empty!");
    } else {
        snapshot.forEach(doc => {
            console.log("------------------------------------------------");
            console.log("DATA FOUND IN FIREBASE:");
            console.log(doc.data()); // This prints the entire object
            console.log("------------------------------------------------");
        });
    }
}

checkFields();