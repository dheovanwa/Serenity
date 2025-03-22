import { Routes, Route } from "react-router-dom";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import EmailSent from "../components/EmailSent";
import NewPass from "../components/NewPass";

const ForgotPassword = () => {
  return (
    <Routes>
      <Route index element={<ForgotPasswordForm />} />
      <Route path="email-sent" element={<EmailSent />} />
      <Route path="reset-password" element={<NewPass />} />
    </Routes>
  );
};

export default ForgotPassword;
