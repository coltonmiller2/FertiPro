// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
// This is a public configuration and is safe to expose.
const firebaseConfig = {
  apiKey: "AIzaSyCTlA0IBbhTmV_K6HVcn4ZB7qDg1HRfXDA",
  authDomain: "prototype-hub-62bx8.firebaseapp.com",
  projectId: "prototype-hub-62bx8",
  storageBucket: "prototype-hub-62bx8.appspot.com",
  messagingSenderId: "647561680320",
  appId: "1:647561680320:web:6715fbafea658f8fcae425"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache settings for better stability
const db = initializeFirestore(app, {
  localCache: { kind: 'persistent' },
});


// Export Firestore instance
export { db };
