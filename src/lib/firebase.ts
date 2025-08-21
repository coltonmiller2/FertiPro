// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore

// Your web app's Firebase configuration
// This is a public configuration and is safe to expose.
const firebaseConfig = {
  apiKey: "AIzaSyD_k5b7Q-E8z1m_e9xP-jZ_k6c9Y0f4w3A",
  authDomain: "project-controls-hub.firebaseapp.com",
  projectId: "project-controls-hub",
  storageBucket: "project-controls-hub.appspot.com",
  messagingSenderId: "351226791458",
  appId: "1:351226791458:web:f108b4822a971a430eac7b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance for the specific database
const db = getFirestore(app);

// Export Firestore instance
export { db };
