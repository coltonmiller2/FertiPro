// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf4RJ-8SxddMoV8Oas_2cYjfauBkz83ds",
  authDomain: "project-controls-hub.firebaseapp.com",
  projectId: "project-controls-hub",
  storageBucket: "project-controls-hub.firebasestorage.app",
  messagingSenderId: "351226791458",
  appId: "1:351226791458:web:f108b4822a971a430eac7b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

// Export Firestore instance
export { db };