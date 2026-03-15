import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVDVaJF_AI1SWbuYWMZ-4hWV6WtsLj1YE",
  authDomain: "nusos-84e35.firebaseapp.com",
  projectId: "nusos-84e35",
  storageBucket: "nusos-84e35.firebasestorage.app",
  messagingSenderId: "640086985517",
  appId: "1:640086985517:web:3762b007ef31cee519a1a4"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };