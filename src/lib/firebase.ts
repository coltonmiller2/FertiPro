// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
// This is a public configuration and is safe to expose.
const firebaseConfig = {
  apiKey: "AIzaSyD_k5b7Q-E8z1m_e9xP-jZ_k6c9Y0f4w3A",
  authDomain: "backyard-bounty-5v5mw.firebaseapp.com",
  projectId: "backyard-bounty-5v5mw",
  storageBucket: "backyard-bounty-5v5mw.appspot.com",
  messagingSenderId: "172564531486",
  appId: "1:172564531486:web:8325d37e40ee08a39a210f"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

// Export Firestore instance
export { db };
