import React from "react";
import { useNavigate } from "react-router-dom";
import { UserProfileController } from "../controllers/UserProfileController";
import UserProfileContent from "../components/profilePsychiatrist";

const PsychiatristProfile: React.FC = () => {
  const navigate = useNavigate();
  const controller = new UserProfileController();

  const handleProfileActions = {
    onLogout: () => {
      localStorage.removeItem("documentId");
      navigate("/signin");
    },

    onNavBack: () => navigate("/"),

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
  };

  return (
    <div>
      <main>
        <UserProfileContent actions={handleProfileActions} />
      </main>
    </div>
  );
};

export default PsychiatristProfile;
