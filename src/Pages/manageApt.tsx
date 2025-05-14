import React from "react";
import ManageAppointmentContent from "../components/ManageAppointmentContent";
import AuthLayout from "../components/BackgroundLayout";

const ManageApt = () => {
  return (
    <div>
    <AuthLayout>
      <ManageAppointmentContent />
    </AuthLayout>
    </div>
  );
};

export default ManageApt;