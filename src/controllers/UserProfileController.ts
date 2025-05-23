import { UserProfileModel, UserProfileData } from "../models/UserProfileModel";
import Compressor from "compressorjs";

export class UserProfileController {
  private model: UserProfileModel;

  constructor() {
    this.model = new UserProfileModel();
  }

  async loadUserData(
    documentId: string | null
  ): Promise<UserProfileData | null> {
    if (!documentId) return null;
    return await this.model.getUserData(documentId);
  }

  async saveUserData(
    documentId: string | null,
    data: Partial<UserProfileData>
  ): Promise<{
    success: boolean;
    errors: string[];
  }> {
    if (!documentId) {
      return { success: false, errors: ["User not authenticated"] };
    }

    const errors = this.model.validateUserData(data);
    if (errors.length > 0) {
      return { success: false, errors };
    }

    try {
      await this.model.updateUserData(documentId, data);
      return { success: true, errors: [] };
    } catch (error) {
      console.error("Error saving user data:", error);
      return { success: false, errors: ["Failed to save changes"] };
    }
  }

  async handleProfilePicture(
    file: File,
    documentId: string | null
  ): Promise<{
    success: boolean;
    base64Image?: string;
    error?: string;
  }> {
    if (!documentId) {
      return { success: false, error: "User not authenticated" };
    }

    return new Promise((resolve) => {
      new Compressor(file, {
        quality: 0.6,
        success: async (compressedFile) => {
          try {
            const reader = new FileReader();
            reader.onload = async () => {
              const base64Image = reader.result as string;
              await this.model.updateProfilePicture(documentId, base64Image);
              resolve({ success: true, base64Image });
            };
            reader.readAsDataURL(compressedFile);
          } catch (error) {
            resolve({
              success: false,
              error: "Failed to update profile picture",
            });
          }
        },
        error: () => {
          resolve({ success: false, error: "Failed to compress image" });
        },
      });
    });
  }
}
