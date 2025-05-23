import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
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
export const auth = getAuth(app);

// Configure auth persistence and popup settings
auth.settings = {
  appVerificationDisabledForTesting: true, // Only for development
};

// Add custom popup settings
const popupSettings = {
  width: 500,
  height: 600,
  target: "_blank",
  features: "location=yes,resizable=yes,statusbar=yes,toolbar=no",
};

// Export popup settings and providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export { popupSettings };

// Collection references
export const db = getFirestore(app);
export const userRef = collection(db, "users");
