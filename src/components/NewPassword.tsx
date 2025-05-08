import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./BackgroundLayout";
import { ForgotPasswordController } from "../controllers/ForgotPasswordController";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";

const NewPass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const navigate = useNavigate();
  const controller = new ForgotPasswordController();

  const handleResetPassword = async () => {
    const oobCode = new URLSearchParams(window.location.search).get("oobCode");

    const result = await controller.handleResetPassword({
      password,
      confirmPassword,
      oobCode: oobCode || "",
    });

    if (result.success) {
      navigate("/signin");
    } else if (result.errors) {
      setErrors(result.errors);
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full p-2 rounded-md bg-white text-gray-900"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
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
