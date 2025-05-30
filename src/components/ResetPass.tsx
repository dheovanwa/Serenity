import React, { useState } from "react";
import { InputWithLabelPass } from "./InputWithLabel";
import { InputWithLabelPassConfirm } from "./InputWithLabel";
import type { ResetPasswordErrors } from "../models/ForgotPasswordModel";

type Props = {
  password: string;
  confirmPassword: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: ResetPasswordErrors;
};

const ResetPasswordFields: React.FC<Props> = ({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  errors = {},
}) => {
  return (
    <>
      <div className="w-full">
      <InputWithLabelPass
        value={password}
        onChange={onPasswordChange}
        name="password"
        error={errors.password}
        autocomplete="new-password"
      />

      {/* Confirm Password */}
      <InputWithLabelPassConfirm
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        name="confirmPassword"
        error={errors.confirmPassword}
      />
      </div>
    </>
  );
};

export default ResetPasswordFields;
