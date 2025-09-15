import React, { } from "react";
import {
  createStyles,
  createTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "../From/InputField";
import Alert from "@mui/material/Alert";
//@ts-ignore
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useSignIn, useUser } from "./CognitoHooks";
import { Box, Link } from "@mui/material";

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     formWrapper: {
//       maxWidth: 320,
//       width: "100%",
//       "& button": {
//         boxShadow: "none !important",
//         borderRadius: 3,
//         padding: "8px 16px",
//       },
//       "& [class*='MuiInputBase-root']": {
//         borderRadius: 3,
//       },
//     },
//     inputStyle: {},
//     switchFormBtn: {
//       cursor: "pointer",
//       display: "inline-block",
//       fontSize: 14,
//       color: theme.palette.grey[500],
//       textDecoration: "none",
//       opacity: 0.8,
//       "&:hover": {
//         opacity: 1,
//       },
//     },
//   })
// );

type loginForm = {
  username: string;
  password: string;
};

type error = {
  name?: string;
  message?: string;
  code?: string;
};

const SignInschema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
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
      inputStyle: {},
      switchFormBtn: {
        cursor: "pointer",
        display: "inline-block",
        fontSize: 14,
        color: theme.palette.grey[500],
        textDecoration: "none",
        opacity: 0.8,
        "&:hover": {
          opacity: 1,
          color: theme.palette.grey[500],
        },
      },
    }
  });

  const navigate = useNavigate();
  //const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<error>({});
  const signIn = useSignIn();
  const user = useUser();

  const form = useForm<loginForm>({
    resolver: yupResolver(SignInschema),
  });

  const { handleSubmit } = form;

  if (user && user?.signInUserSession?.accessToken?.jwtToken) {
    const userRole = user?.signInUserSession?.idToken?.payload?.["cognito:groups"][0];
    //  route to root when an active user available
    if (userRole === "tenant_admin" || userRole === "super_admin") {
      navigate("/tenants");
    } else {
      console.log("pushing to root");
      navigate("/");
    }
  }

  const onSubmit = React.useCallback(
    async (data: loginForm) => {
      setLoading(true);
      setError({});

      try {
        signIn({
          email: data.username,
          password: data.password,
          onSuccess: user => {
            if (
              user?.challengeName &&
              user?.challengeName === "NEW_PASSWORD_REQUIRED"
            ) {
              // newUser.setnewUser(user);
              navigate("/new-password");
            } else if (user) {
              const userRole = user?.signInUserSession?.idToken?.payload?.["cognito:groups"][0];
              if (userRole === "tenant_admin" || userRole === "super_admin") {
                navigate("/tenants");
              } else {
                navigate("/");
              }
            } else {
              setLoading(false);
            }
          },
          onError: err => {
            setLoading(false);
            //@ts-ignore
            setError(err);
          },
        });
      } catch (error) {
        console.log(error);
        setLoading(false);
        //@ts-ignore
        setError(error);
      }
    },
    [setLoading, history, setError, signIn]
  );

  return (
    <AuthLayout>
      <ThemeProvider theme={pageTheme}>
        <Box sx={(theme) => theme.custom.formWrapper}>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <h4 className="form-secondary-title">
                Sign in with your username and password
              </h4>
              <Box sx={(theme) => theme.custom.inputStyle}>
                <InputField name="username" label="Username" />
              </Box>
              <Box sx={(theme) => theme.custom.inputStyle}>
                <InputField name="password" label="Password" type="password" />
              </Box>

              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={(theme) => theme.custom.switchFormBtn}
                style={{ marginBottom: 10 }}
              >
                Forgot your password?
              </Link>
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
                //sx={{ borderRadius: "3px !important" }}
              >
                {loading ? "Please wait..." : "Login"}
              </Button>
            </form>
          </FormProvider>
        </Box>
      </ThemeProvider>
    </AuthLayout>
  );
}
