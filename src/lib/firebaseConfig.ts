import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyADF4EHFyLVqUJCSJ5OOnMUmUIIQCsN0WU",
  authDomain: "backyard-bounty-5v5mw.firebaseapp.com",
  projectId: "backyard-bounty-5v5mw",
  storageBucket: "backyard-bounty-5v5mw.firebasestorage.app",
  messagingSenderId: "172564531486",
  appId: "1:172564531486:web:8325d37e40ee08a39a210f"
};

const app = initializeApp(firebaseConfig);

export default app;