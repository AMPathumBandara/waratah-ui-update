import React, { useEffect } from "react";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { Box, Link, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "components/From/InputField";
import Alert from "@mui/material/Alert";
//@ts-ignore
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Auth } from "aws-amplify";
import AuthLayout from "./AuthLayout";
import { Link as RouterLink, useNavigate } from "react-router";
import { useQuery } from "utils/useQueryHook";

// const useStyles = makeStyles((theme: Theme) =>
// ({
//   formWrapper: {
//     maxWidth: 320,
//     width: "100%",
//     "& button": {
//       boxShadow: "none !important",
//       borderRadius: 3,
//       padding: "8px 16px",
//     },
//     "& [class*='MuiInputBase-root']": {
//       borderRadius: 3,
//     },
//   },
//   inputStyle: {
//     marginBottom: 10,
//   },
//   switchFormBtn: {
//     cursor: "pointer",
//     display: "inline-block",
//     fontSize: 14,
//     color: theme.palette.grey[500],
//     textDecoration: "none",
//     opacity: 0.8,
//     "&:hover": {
//       opacity: 1,
//     },
//   },
// })
// );

type error = {
  name?: string;
  message?: string;
  code?: string;
};
type resetData = {
  CodeDeliveryDetails: {
    AttributeName?: string;
    DeliveryMedium?: string;
    Destination?: string;
  };
};
type changePasswordSubmit = {
  code: string;
  new_password: string;
};

const resetSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
});

const ChangePswSchema = yup.object().shape({
  code: yup.string().required("Code is required"),
  new_password: yup
    .string()
    .required("New Password is required")
    .min(8, "Password must have minimum 8 characters"),
  confirm_password: yup
    .string()
    //@ts-ignore
    .oneOf([yup.ref("new_password"), null], "Passwords must match"),
});

const theme = useTheme();

// extend / override the current theme
const pageTheme = createTheme(theme, {
  custom: {
    formWrapper: {
      maxWidth: 320,
      width: "100%",
      "& button": {
        boxShadow: "none !important",
        borderRadius: 3,
        padding: "8px 16px",
      },
      "& [class*='MuiInputBase-root']": {
        borderRadius: 3,
      },
    },
    inputStyle: {
      marginBottom: 10,
    },
    switchFormBtn: {
      cursor: "pointer",
      display: "inline-block",
      fontSize: 14,
      color: theme.palette.grey[500],
      textDecoration: "none",
      opacity: 0.8,
      "&:hover": {
        opacity: 1,
      },
    },
  },
});

export default function ForgotPassword() {

  // const { token, email } = useParams<{ token: string, email: string }>();
  const query = useQuery();
  const [reset, setReset] = React.useState<resetData | null>(null);
  const email = query.get("email");
  const token = query.get("token");
  // const { token } = query;

  const [username, setUsername] = React.useState(email);
  const navigate = useNavigate();

  useEffect(() => {
    Auth.currentSession()
      .then(res => {
        if (res) {
          navigate("/");
        }
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  function Reset() {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<error>({});

    const form = useForm({
      resolver: yupResolver(resetSchema),
    });

    const { handleSubmit } = form;

    const onSubmit = async (data: any) => {
      const { username } = data;
      setLoading(true);

      await Auth.forgotPassword(username)
        .then(data => {
          setUsername(form.getValues("username") as unknown as string);
          setReset(data);
        })
        .catch(err => {
          setLoading(false);
          setError(err);
        });
    };

    return (
      <>
        <ThemeProvider theme={pageTheme}>
          <Box sx={(theme) => theme.custom.formWrapper}>
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography
                  variant="h6"
                  color="textSecondary"
                  gutterBottom={true}
                  style={{ marginBottom: 10 }}
                >
                  Forgot your password?
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom={true}
                  className="form-secondary-text"
                  style={{ marginBottom: 20, lineHeight: 1.2 }}
                >
                  Enter your Username below and we will send a message to reset
                  your password
                </Typography>

                <Box sx={(theme) => theme.custom.inputStyle}>
                  <InputField name="username" label="Username" />
                </Box>

                {error?.message && (
                  <Alert severity="error" style={{ marginBottom: 10 }}>
                    {error?.message}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  fullWidth={true}
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className="form-action-btn"
                  sx={{ borderRadius: "3px !important" }}
                >
                  {loading ? "Please wait..." : "Reset Password"}
                </Button>

                <Link
                  component={RouterLink}
                  to="/login"
                  sx={(theme) => theme.custom.switchFormBtn}
                  style={{ marginTop: 10 }}
                >
                  Back to login
                </Link>
              </form>
            </FormProvider>
          </Box>
        </ThemeProvider>
      </>
    );
  }

  function ResetPassword() {
    const query = useQuery();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState<error>({});
    const navigate = useNavigate();
    const form = useForm({
      resolver: yupResolver(ChangePswSchema),
    });
    const token = query.get("token");

    const { handleSubmit } = form;

    const onSubmit = async (data: changePasswordSubmit) => {
      setLoading(true);
      setError({});
      const { code, new_password } = data;

      if (username && new_password) {
        //@ts-ignore
        await Auth.forgotPasswordSubmit(username, code, new_password)
          .then(data => {
            setSuccess(true);
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          })
          .catch(err => {
            setError(err);
            setLoading(false);
          });
      }
    };
    return (
      <>
        <ThemeProvider theme={pageTheme}>
          <Box sx={(theme) => theme.custom.formWrapper}>
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Typography
                  variant="h6"
                  color="textSecondary"
                  gutterBottom={true}
                  style={{ marginBottom: 10 }}
                >
                  Change Password
                </Typography>

                <Typography
                  variant="body2"
                  color="textSecondary"
                  gutterBottom={true}
                  style={{ marginBottom: 20, lineHeight: 1.2 }}
                >
                  We have sent a password reset code by{" "}
                  {reset?.CodeDeliveryDetails.DeliveryMedium} to{" "}
                  {reset?.CodeDeliveryDetails.Destination}. Enter it below to
                  reset your password.
                </Typography>

                <Box sx={(theme) => theme.custom.inputStyle}>
                  <InputField name="code" label="Code" defaultValue={token} />
                  <InputField
                    name="new_password"
                    label="New Password"
                    type="password"
                  />
                  <InputField
                    name="confirm_password"
                    label="Enter New Password Again"
                    type="password"
                  />
                </Box>

                {error?.message && (
                  <Alert severity="error" style={{ marginBottom: 10 }}>
                    {error?.message}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" style={{ marginBottom: 10 }}>
                    Your password has been changed.
                    <br />
                    You are being redirected to the login page, please wait…
                  </Alert>
                )}
                <Button
                  variant="contained"
                  fullWidth={true}
                  type="submit"
                  color="primary"
                  disabled={loading}
                  className="form-action-btn"
                  sx={{ borderRadius: "3px !important" }}
                >
                  {loading ? "Please wait..." : "Change Password"}
                </Button>
              </form>
            </FormProvider>
          </Box>
        </ThemeProvider>
      </>
    );
  }
  return <AuthLayout>{!username ? <Reset /> : <ResetPassword />}</AuthLayout>;
}
