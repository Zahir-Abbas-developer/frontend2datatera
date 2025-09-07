import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Loader from "../../components/shared/loader/Loader";
import logo from "../../assets/images/logo.jpg";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const changePassword = urlSearchParams?.get("changePassword");
  const token = urlSearchParams.get("token");

  const initialValues = {
    confirmPassword: "",
    password: "",
  };

  const validationSchema = yup.object().shape({
    password: yup.string().required("This field is required"),
    confirmPassword: yup.string().when("password", {
      is: (val) => (val && val.length > 0 ? true : false),
      then: yup
        .string()
        .oneOf([yup.ref("password")], "Both password need to be the same"),
    }),
  });

  const onSubmit = async (values, resetForm) => {
    try {
      setIsLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/reset-password`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.message) {
        navigate("/");
        resetForm();
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast(error?.response?.data?.message, { type: "error" });
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-col items-center">
          <a href="https://aiagentlbs.com/" target="_blank">
            <img src={logo} alt="logo" className="h-16 mb-2" />
          </a>
          <CardTitle className="text-xl font-semibold">
            {changePassword ? "Change" : "Reset"} Password
          </CardTitle>
          <p className="text-sm text-gray-500">
            Please enter your new password
          </p>
        </CardHeader>

        <CardContent>
          {isLoading && <Loader />}

          <form
            onSubmit={formik.handleSubmit}
            className="flex flex-col space-y-4"
          >
            {/* Password */}
            <div className="relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                disabled={isLoading}
                {...formik.getFieldProps("confirmPassword")}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.confirmPassword}
                  </p>
                )}
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {changePassword ? "Change" : "Reset"}{" "}
              {isLoading ? "Password..." : "Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
