import React from "react";
import Navbar from "../components/Navbar";
import UserProfileContent from "../components/profileUser";

const UserProfile: React.FC = () => {
    return (
      <div>
        <Navbar />
        <main>
          <UserProfileContent />
        </main>
      </div>
    );
  };

export default UserProfile;
