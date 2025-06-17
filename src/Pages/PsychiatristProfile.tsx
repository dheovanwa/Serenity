import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfileController } from "../controllers/UserProfileController";
import UserProfileContent from "../components/profilePsychiatrist";

const PsychiatristProfile: React.FC = () => {
  const navigate = useNavigate();
  const controller = new UserProfileController();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const documentId = localStorage.getItem("documentId");
      const userType = localStorage.getItem("userType");

      if (!documentId || userType !== "psychiatrist") {
        navigate("/signin");
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleProfileActions = {
    onLogout: () => {
      localStorage.removeItem("documentId");
      localStorage.removeItem("userType");
      navigate("/signin");
    },

    onNavBack: () => navigate("/dashboard"),

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
      return await controller.saveUserData(documentId, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <main>
        <UserProfileContent actions={handleProfileActions} />
      </main>
    </div>
  );
};

export default PsychiatristProfile;
