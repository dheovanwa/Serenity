import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export interface UserProfileData {
  firstName: string;
  lastName: string;
  address: string;
  sex: string;
  education: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  profilePicture?: string;
}

export class UserProfileModel {
  async getUserData(documentId: string): Promise<UserProfileData | null> {
    try {
      const userDocRef = doc(db, "users", documentId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          address: userData.address || "",
          sex: userData.sex || "",
          education: userData.education || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          country: userData.country || "",
          city: userData.city || "",
          profilePicture: userData.profilePicture,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  async updateUserData(documentId: string, data: Partial<UserProfileData>) {
    const userDocRef = doc(db, "users", documentId);
    await updateDoc(userDocRef, data);
  }

  async updateProfilePicture(documentId: string, base64Image: string) {
    const userDocRef = doc(db, "users", documentId);
    await updateDoc(userDocRef, { profilePicture: base64Image });
  }

  validateUserData(data: Partial<UserProfileData>): string[] {
    const errors: string[] = [];

    if (!data.firstName?.trim()) {
      errors.push("First Name cannot be empty");
    }

    if (data.phoneNumber && !/^\d{10,13}$/.test(data.phoneNumber)) {
      errors.push("Invalid phone number format");
    }

    return errors;
  }
}
