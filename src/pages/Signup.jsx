import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { FaEye, FaEyeSlash, FaFileInvoice, FaImage } from "react-icons/fa";
import { registerUser } from "../Redux/slices/auth/authService";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import * as Yup from 'yup'



function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [logoPreview, setLogoPreview] = useState(null);
  const [apiError, setApiError] = useState("");
  const MAX_LOGO_SIZE = 5 * 1024 * 1024

  const signupInitialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    industry: '',
    currencySymbol: '',
    logo: null,
  }

  const signupSchema = Yup.object({
    firstName: Yup.string().trim().required('First name is required'),
    lastName: Yup.string().trim().required('Last name is required'),
    email: Yup.string()
      .trim()
      .email('Enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Minimum 8 characters')
      .max(20, 'Maximum 20 characters')
      .matches(/[A-Z]/, 'At least 1 uppercase letter (A-Z)')
      .matches(/[0-9]/, 'At least 1 number (0-9)')
      .matches(/[^A-Za-z0-9]/, 'At least 1 special character (e.g. !@#$%^&*)'),
    companyName: Yup.string().trim().required('Company name is required'),
    address: Yup.string().trim().required('Address is required'),
    city: Yup.string().trim().required('City is required'),
    zipCode: Yup.string()
      .trim()
      .required('Zip code is required')
      .matches(/^\d{6}$/, 'Zip code must be 6 digits'),
    industry: Yup.string().trim(),
    currencySymbol: Yup.string().trim().required('Currency symbol is required'),
    logo: Yup.mixed()
      .nullable()
      .test('fileSize', 'Logo must be less than 5 MB', (file) => {
        if (!file) return true
        return file.size <= MAX_LOGO_SIZE
      })
      .test('fileType', 'Only image files are allowed', (file) => {
        if (!file) return true
        return file.type.startsWith('image/')
      }),
  })

  function getPasswordStrength(password) {
    if (!password) return { label: 'Weak', width: '0%' }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { label: 'Weak', width: '25%' }
    if (score === 2) return { label: 'Fair', width: '50%' }
    if (score === 3) return { label: 'Good', width: '75%' }
    return { label: 'Strong', width: '100%' }
  }

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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            width: "100%",
            maxWidth: "900px",
            padding: 4,
            borderRadius: "8px",
          }}
        >
          <Box textAlign="center" mb={4}>
            <Typography
              variant="body1"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                color: "#444",
                pb: "5px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <FaFileInvoice />
              InvoiceApp
            </Typography>

            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ textAlign: "center", marginTop: "15px" }}
            >
              Create Your Account
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", color: "#666" }}
            >
              Set up your company and start invoicing in minutes.
            </Typography>
          </Box>

          <Formik
            initialValues={signupInitialValues}
            validationSchema={signupSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setApiError("");
              try {
                const response = await registerUser(values);
                if (response?.token) {
                  navigate("/login");
                }
              } catch (err) {
                setApiError(
                  getApiErrorMessage(err, "Signup failed. Please try again.")
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
              setFieldValue,
              setFieldTouched,
              isSubmitting,
            }) => {
              const strength = getPasswordStrength(values.password);

              const handleLogoChange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFieldValue("logo", file);
                  setFieldTouched("logo", true, false);
                  setFileName(file.name);
                  setLogoPreview(URL.createObjectURL(file));
                } else {
                  setFieldValue("logo", null);
                  setFileName("No file chosen");
                  setLogoPreview(null);
                }
              };

              return (
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

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 4,
                      marginTop: "35px",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="bold">User Information</Typography>
                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body2">First Name*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter first name"
                        sx={{ mb: 2 }}
                        {...fieldProps(
                          "firstName",
                          touched,
                          errors,
                          handleChange,
                          handleBlur
                        )}
                        value={values.firstName}
                      />

                      <Typography variant="body2">Last Name*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter last name"
                        sx={{ mb: 2 }}
                        {...fieldProps(
                          "lastName",
                          touched,
                          errors,
                          handleChange,
                          handleBlur
                        )}
                        value={values.lastName}
                      />

                      <Typography variant="body2">Email*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter your email"
                        type="email"
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

                      <Typography variant="body2">Password*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter password"
                        type={showPassword ? "text" : "password"}
                        sx={{ mb: touched.password && errors.password ? 0.5 : 1 }}
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
                          height: "4px",
                          backgroundColor: "#ddd",
                          width: "100%",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: strength.width,
                            height: "100%",
                            backgroundColor: "#555",
                            transition: "width 0.2s ease",
                          }}
                        />
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Password strength: {strength.label}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="bold">Company Information</Typography>
                      <Divider sx={{ my: 2 }} />

                      <Typography variant="body2">Company Name*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter company name"
                        sx={{ mb: 2 }}
                        {...fieldProps(
                          "companyName",
                          touched,
                          errors,
                          handleChange,
                          handleBlur
                        )}
                        value={values.companyName}
                      />

                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Company Logo
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          mb: touched.logo && errors.logo ? 0.5 : 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            minWidth: 72,
                            border: "1px dashed #ccc",
                            borderRadius: "6px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#f5f5f5",
                            overflow: "hidden",
                          }}
                        >
                          {logoPreview ? (
                            <Box
                              component="img"
                              src={logoPreview}
                              alt="Logo preview"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <FaImage size={28} color="#bbb" />
                          )}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            component="label"
                            sx={{
                              display: "flex",
                              alignItems: "stretch",
                              border: "1px solid #d5d5d5",
                              borderRadius: "6px",
                              overflow: "hidden",
                              cursor: "pointer",
                              height: 40,
                              bgcolor: "#fff",
                              "&:hover": { borderColor: "#bbb" },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                px: 1.5,
                                fontSize: "0.8125rem",
                                color: "#333",
                                borderRight: "1px solid #333",
                                bgcolor: "#fafafa",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Choose File
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                px: 1.5,
                                fontSize: "0.8125rem",
                                color: "#666",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fileName}
                            </Box>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={handleLogoChange}
                              onBlur={() => setFieldTouched("logo", true)}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "#999",
                              mt: 0.5,
                              fontSize: "0.7rem",
                            }}
                          >
                            Max 2-5 MB
                          </Typography>
                        </Box>
                      </Box>
                      {touched.logo && errors.logo && (
                        <Typography
                          variant="caption"
                          color="error"
                          display="block"
                          sx={{ mb: 2 }}
                        >
                          {errors.logo}
                        </Typography>
                      )}

                      <Typography variant="body2">Address*</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter company address"
                        sx={{ mb: 2 }}
                        {...fieldProps(
                          "address",
                          touched,
                          errors,
                          handleChange,
                          handleBlur
                        )}
                        value={values.address}
                      />

                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">City*</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter city"
                            sx={{ mb: 2 }}
                            {...fieldProps(
                              "city",
                              touched,
                              errors,
                              handleChange,
                              handleBlur
                            )}
                            value={values.city}
                          />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">Zip Code*</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="6 digit zip code"
                            sx={{ mb: 2 }}
                            {...fieldProps(
                              "zipCode",
                              touched,
                              errors,
                              handleChange,
                              handleBlur
                            )}
                            value={values.zipCode}
                          />
                        </Box>
                      </Box>

                      <Typography variant="body2">Industry</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Industry type"
                        sx={{ mb: 2 }}
                        name="industry"
                        value={values.industry}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <Typography variant="body2">Currency Symbol*</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="$, ₹, €, AED"
                        {...fieldProps(
                          "currencySymbol",
                          touched,
                          errors,
                          handleChange,
                          handleBlur
                        )}
                        value={values.currencySymbol}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ textAlign: "right" }} mb={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: "#4a4a4a",
                        textTransform: "none",
                        px: 4,
                      }}
                    >
                      {isSubmitting ? "Signing up..." : "Sign Up"}
                    </Button>
                  </Box>

                  <Typography
                    sx={{ textAlign: "center" }}
                    variant="body2"
                    color="text.secondary"
                  >
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                      }}
                    >
                      Login
                    </Link>
                  </Typography>
                </Form>
              );
            }}
          </Formik>
        </Paper>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        py={2}
        sx={{ textAlign: "center", padding: "20px" }}
      >
        © 2025 InvoiceApp. All rights reserved.
      </Typography>
    </Box>
  );
}

export default Signup;
