// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
// This is a public configuration and is safe to expose.
const firebaseConfig = {
  apiKey: "AIzaSyADF4EHFyLVqUJCSJ5OOnMUmUIIQCsN0WU",
  authDomain: "backyard-bounty-5v5mw.firebaseapp.com",
  projectId: "backyard-bounty-5v5mw",
  storageBucket: "backyard-bounty-5v5mw.firebasestorage.app",
  messagingSenderId: "172564531486",
  appId: "1:172564531486:web:8325d37e40ee08a39a210f"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

// Export Firestore instance
export { db };
