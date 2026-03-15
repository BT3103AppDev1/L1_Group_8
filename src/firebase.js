import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAVDVaJF_AI1SWbuYWMZ-4hWV6WtsLj1YE",
  authDomain: "nusos-84e35.firebaseapp.com",
  projectId: "nusos-84e35",
  storageBucket: "nusos-84e35.firebasestorage.app",
  messagingSenderId: "640086985517",
  appId: "1:640086985517:web:3762b007ef31cee519a1a4"
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;