import React, { useEffect, useState } from "react";
import { createStyles, Theme, makeStyles } from "@mui/material/styles";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "components/From/InputField";
import Alert from "@mui/material/Alert";
//@ts-ignore
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Auth } from "aws-amplify";
import AuthLayout from "./AuthLayout";
import { Link, useHistory } from "react-router-dom";
import { useForgotPasswordMutation } from "generated/graphql";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  })
);


const resetSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
});

const CountdownTimer = ({ initialSeconds = 0 }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      // Clear the interval once the countdown reaches 0
      return () => clearInterval(interval);
    }
  }, [seconds]);

  return (
    <span>{seconds}s</span>      
  );
};

export default function ForgotPassword() {
  const history = useHistory();

  const [
    ForgotPassword,
    { loading: forgotPasswordLoading, error: forgotPasswordError, data: forgotPasswordData },
  ] = useForgotPasswordMutation({
    errorPolicy: "all",
  });


  useEffect(() => {
    Auth.currentSession()
      .then(res => {
        if (res) {
          history.push("/");
        }
      })
      .catch(e => {
        console.log(e);
      });
  }, []);

  function Reset() {
    const classes = useStyles();

    const form = useForm({
      resolver: yupResolver(resetSchema),
    });

    const { handleSubmit } = form;

    const onSubmit = async (data: any) => {
      const { username } = data;

      try {

        const { errors } = await ForgotPassword({
          variables: { email: username }
        });

        if (errors && errors.length > 0) {
          return;
        }
  
        setTimeout(() => {
          history.push("/login");
        }, 10000);
      } catch (error: any) {
        console.log({error});
      }
    };

    return (
      <>
        <div className={classes.formWrapper}>
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

              <div className={classes.inputStyle}>
                <InputField name="username" label="Username" />
              </div>

              {forgotPasswordError?.message && (
                <Alert severity="error" style={{ marginBottom: 10 }}>
                  {forgotPasswordError?.message}
                </Alert>
              )}

              {forgotPasswordData?.forgotPassword?.message && (
                <Alert severity="success" style={{ marginBottom: 10 }}>
                  Please check your email for the password reset instructions.
                  <br />
                  You are being redirected to the login page, please wait… <CountdownTimer initialSeconds={10} />
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth={true}
                type="submit"
                color="primary"
                disabled={forgotPasswordLoading}
                className="form-action-btn"
              >
                {forgotPasswordLoading ? "Please wait..." : "Reset Password"}
              </Button>

              <Link
                to="/login"
                className={classes.switchFormBtn}
                style={{ marginTop: 10 }}
              >
                Back to login
              </Link>
            </form>
          </FormProvider>
        </div>
      </>
    );
  }

  return <AuthLayout><Reset /></AuthLayout>;
}
