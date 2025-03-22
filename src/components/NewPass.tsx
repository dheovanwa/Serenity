import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { auth } from "../config/firebase";
import { confirmPasswordReset } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const NewPass = () => {
  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    let validationErrors: { [key: string]: string } = {};

    if (!password) validationErrors.password = "Password is required.";
    else if (password.length < 8)
      validationErrors.password = "Password must be at least 8 characters.";

    if (!newPass) validationErrors.newPass = "Confirm password is required.";
    else if (newPass !== password)
      validationErrors.newPass = "Passwords do not match.";

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const oobCode = new URLSearchParams(window.location.search).get(
          "oobCode"
        );
        if (oobCode) {
          await confirmPasswordReset(auth, oobCode, password);
          navigate("/signin");
        }
      } catch (error) {
        setErrors({
          password: "Invalid reset link. Please request a new one.",
        });
      }
    }
  };

  return (
    <AuthLayout>
      <div className="absolute top-20">
        <h2 className="text-4xl font-bold text-white mb-5 text-center">
          Reset Your Password
        </h2>
        <div>
          <label className="block text-white text-lg mb-2">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-2 rounded-md bg-white text-gray-900"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-white text-lg mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="Confirm your password"
            className="w-full p-2 rounded-md bg-white text-gray-900"
          />
          {errors.newPass && (
            <p className="text-red-500 text-sm mt-1">{errors.newPass}</p>
          )}
        </div>

        <button
          onClick={handleResetPassword}
          className="w-full bg-white text-blue-400 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow mt-4"
        >
          Reset Password
        </button>
      </div>
    </AuthLayout>
  );
};

export default NewPass;
