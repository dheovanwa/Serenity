import React from "react";
import { useNavigate } from "react-router-dom";
import { UserProfileController } from "../controllers/UserProfileController";
import UserProfileContent from "../components/profileUser";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const controller = new UserProfileController();

  const handleProfileActions = {
    onLogout: () => {
      localStorage.removeItem("documentId");
      navigate("/signin");
    },

    onNavBack: () => navigate("/home"),

    loadUserData: async () => {
      const documentId = localStorage.getItem("documentId");
      if (!documentId) {
        navigate("/signin");
        return null;
      }
      return await controller.loadUserData(documentId);
    },

    saveUserData: async (data: any) => {
      const documentId = localStorage.getItem("documentId");
      return await controller.saveUserData(documentId, data);
    },

    updateProfilePicture: async (file: File) => {
      const documentId = localStorage.getItem("documentId");
      return await controller.handleProfilePicture(file, documentId);
    },
  };

  return (
    <div>
      <main>
        <UserProfileContent actions={handleProfileActions} />
      </main>
    </div>
  );
};

export default UserProfile;
