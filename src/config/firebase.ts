import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAw8I6vOwo0Jqz3kpzFpVOVXANfm80y9hc",
  authDomain: "serenity-646e2.firebaseapp.com",
  projectId: "serenity-646e2",
  storageBucket: "serenity-646e2.firebasestorage.app",
  messagingSenderId: "1044339589442",
  appId: "1:1044339589442:web:b2386ca1f10ee691ea08db",
  measurementId: "G-9SWNQF1K9W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Ensure the app instance is passed here
export const db = getFirestore(app);

// Collection references
const userRef = collection(db, "users");
