import { useNavigate } from "react-router-dom";
import AuthLayout from "./BackgroundLayout";

const EmailSent = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="absolute top-20 text-center text-white">
        <h2 className="text-4xl font-bold mb-5">Check Your Email!</h2>
        <p className="text-lg">A password reset link has been sent.</p>
        <button
          onClick={() => navigate("/forgot-password/reset-password")}
          className="mt-5 bg-white text-blue-400 py-2 px-6 rounded-lg font-semibold hover:bg-gray-50 transition shadow"
        >
          Continue
        </button>
      </div>
    </AuthLayout>
  );
};

export default EmailSent;
