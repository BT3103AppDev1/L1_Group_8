import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBarDju7PpWLNbzk3_6WKO7BT7ZxnoINR8",
  authDomain: "nusos-85117.firebaseapp.com",
  projectId: "nusos-85117",
  storageBucket: "nusos-85117.firebasestorage.app",
  messagingSenderId: "263489949944",
  appId: "1:263489949944:web:1042c8fd63c5b354676b0d"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, auth, storage };