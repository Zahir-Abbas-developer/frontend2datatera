import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import styles from "../ResetPassword/ResetPassword.module.css";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../../assets/images/logo.jpg";
import { useFormik } from "formik";
import axios from "axios";
import Loader from "../../components/shared/loader/Loader";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [showpassword, setShowpassword] = useState(false);
  const [showconfirmPassword, setShowconfirmPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);

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
    <div className={styles.signin_main}>
      <div className={styles.pic_div}>
        <a href="https://aiagentlbs.com/" target="_blank"><img src={logo} className={styles.logo} alt="logo" /></a>
      </div>
      <div className={styles.signinUpper}>
        <div className={styles.signin}>
          <h6 className={styles.login_heading}>{changePassword ? 'Change' : 'Reset'} Password</h6>
          <p className={styles.explore_future_heading}>
            Please enter your new password
          </p>
          {isloading && <Loader />}
          <Box
            className={styles.form}
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
          >
            <div className={styles.eye_icon_main}>
              <TextField
                type={showpassword ? "text" : "password"}
                name="password"
                label="Password"
                disabled={isloading}
                variant="outlined"
                style={{ marginBottom: "1rem", width: "100%" }}
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />

              {showpassword ? (
                <AiOutlineEyeInvisible
                  className={styles.eye_icon}
                  onClick={(e) => {
                    setShowpassword(!showpassword);
                  }}
                />
              ) : (
                <AiOutlineEye
                  className={styles.eye_icon}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowpassword(!showpassword);
                  }}
                />
              )}
            </div>

            <div className={styles.eye_icon_main}>
              <TextField
                type={showconfirmPassword ? "text" : "password"}
                name="confirmPassword"
                label="Confirm Password"
                variant="outlined"
                disabled={isloading}
                style={{ marginBottom: "1rem", width: "100%" }}
                {...formik.getFieldProps("confirmPassword")}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
              />

              {showconfirmPassword ? (
                <AiOutlineEyeInvisible
                  className={styles.eye_icon}
                  onClick={(e) => {
                    setShowconfirmPassword(!showconfirmPassword);
                  }}
                />
              ) : (
                <AiOutlineEye
                  className={styles.eye_icon}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowconfirmPassword(!showconfirmPassword);
                  }}
                />
              )}
            </div>
            <Button
              type="submit"
              disabled={isloading}
              className={styles.signin_login_btn}
            >
              {changePassword ? 'Change' : 'Reset'} {isloading ? "Password..." : "Password"}
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};
export default ResetPassword;
