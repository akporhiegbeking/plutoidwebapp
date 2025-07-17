// Firebase configuration for Plutoid
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFclXvFhqKesEgYFVchce1OzEPpx4X8Sg",
  authDomain: "plutoidapp-7754b.firebaseapp.com",
  projectId: "plutoidapp-7754b",
  storageBucket: "plutoidapp-7754b.appspot.com",
  messagingSenderId: "638966345653",
  appId: "1:638966345653:web:9218cdb82c41d4a614f3fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export { app };