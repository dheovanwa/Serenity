import { auth, db } from "../config/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { query, where, getDocs, collection, addDoc } from "firebase/firestore";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export class LoginModel {
  async authenticate(credentials: LoginCredentials) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      return userCredential.user.uid;
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email format");
      } else if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password");
      }
      throw error;
    }
  }

  async getUserData(userId: string) {
    const userQuery = query(
      collection(db, "users"),
      where("uid", "==", userId)
    );
    const querySnapshot = await getDocs(userQuery);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        docId: userDoc.id,
        data: userDoc.data(),
      };
    }
    return null;
  }

  validateInputs(credentials: LoginCredentials): LoginErrors {
    const errors: LoginErrors = {};

    // Email validation
    if (!credentials.email) {
      errors.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = "Email harus dalam format example@email.com";
    }

    // Password validation
    if (!credentials.password) {
      errors.password = "Kata sandi tidak boleh kosong";
    }

    return errors;
  }

  async handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        console.log("New user detected, creating user document...");
        // New user - create user document
        const userDocRef = await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          termsAccepted: true,
          profilePicture: null,
          address: null,
          birthOfDate: null,
          sex: null,
          phoneNumber: null,
          isUser: true,
        });

        return {
          docId: userDocRef.id,
          success: true,
          isNewUser: true,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
        };
      }

      // Existing user - check birthOfDate
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return {
        docId: userDoc.id,
        success: true,
        isNewUser: false,
        needsCompletion: !userData.birthOfDate,
        userData: userData,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false };
    }
  }
}
