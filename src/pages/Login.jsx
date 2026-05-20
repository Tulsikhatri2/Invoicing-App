import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { FaEye, FaEyeSlash, FaFileInvoice } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { loginUser } from "../Redux/slices/auth/authService";
import { setCredentials } from "../Redux/slices/auth/authSlice";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState("");
  const dispatch = useDispatch()

  const loginSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const fieldProps = (name, touched, errors, handleChange, handleBlur) => ({
    name,
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && Boolean(errors[name]),
    helperText: touched[name] && errors[name],
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "420px" }}>
          <Typography
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mb: 3,
              color: "#444",
            }}
          >
            <FaFileInvoice />
            InvoiceApp
          </Typography>

          <Paper
            sx={{
              padding: 4,
              border: "1px solid #ddd",
              boxShadow: "none",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              sx={{
                textAlign: "center",
                color: "#777",
                mb: 3,
              }}
            >
              Log in to your account.
            </Typography>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setApiError("");
                try {
                  const response = await loginUser({
                    email: values.email.trim(),
                    password: values.password,
                    rememberMe: rememberMe
                  });
                  if (response?.token) {
                    const now = new Date().getTime();
                    const expirationTime = rememberMe
                      ? now + 7 * 24 * 60 * 60 * 1000
                      : now + 2 * 60 * 60 * 1000;

                    dispatch(setCredentials({
                      token: response.token,
                      tokenExpiry: expirationTime,
                    }));

                    navigate("/items");
                  }
                } catch (err) {
                  setApiError(
                    getApiErrorMessage(err, "Login failed. Please try again.")
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
              }) => (
                <Form noValidate>
                  {apiError && (
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        alignItems: "flex-start",
                        "& .MuiAlert-message": {
                          whiteSpace: "pre-line",
                          width: "100%",
                        },
                      }}
                    >
                      {apiError}
                    </Alert>
                  )}

                  <Typography sx={{ fontSize: "14px", mb: 0.5 }}>
                    Email Address*
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter your email"
                    sx={{ mb: 2 }}
                    {...fieldProps(
                      "email",
                      touched,
                      errors,
                      handleChange,
                      handleBlur
                    )}
                    value={values.email}
                  />

                  <Typography sx={{ fontSize: "14px", mb: 0.5 }}>
                    Password*
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    sx={{ mb: touched.password && errors.password ? 0.5 : 2 }}
                    {...fieldProps(
                      "password",
                      touched,
                      errors,
                      handleChange,
                      handleBlur
                    )}
                    value={values.password}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              edge="end"
                              size="small"
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ color: "#555" }}
                            >
                              {showPassword ? (
                                <FaEyeSlash size={16} />
                              ) : (
                                <FaEye size={16} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Remember me"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: "#4a4a4a",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#333",
                        },
                      }}
                    >
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>

            <Typography
              sx={{
                textAlign: "center",
                fontSize: "14px",
                color: "#777",
              }}
            >
              <Link
                to="/signup"
                style={{
                  color: "#555",
                  textDecoration: "none",
                }}
              >
                Create account
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", pb: 3 }}>
        <Typography
          variant="body2"
          sx={{
            color: "#888",
            mb: 1,
          }}
        >
          © 2025 InvoiceApp. All rights reserved.
        </Typography>

        <Box>
          <a
            href="#"
            style={{
              margin: "0 8px",
              color: "#777",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>

          <a
            href="#"
            style={{
              margin: "0 8px",
              color: "#777",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Terms of Service
          </a>

          <a
            href="#"
            style={{
              margin: "0 8px",
              color: "#777",
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            Support
          </a>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;