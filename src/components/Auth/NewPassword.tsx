import React from "react";
import { createStyles, Theme, makeStyles } from "@mui/material/styles";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { FormProvider, useForm } from "react-hook-form";
import InputField from "components/From/InputField";
import Alert from "@mui/material/Alert";
//@ts-ignore
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { CognitoUser } from "@aws-amplify/auth";
import { useHistory, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useCompleteNewPassword, useUser } from "./CognitoHooks";

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
      },
    },
  })
);

type error = {
  name?: string;
  message?: string;
  code?: string;
};

const ChangePswSchema = yup.object().shape({
  new_password: yup
    .string()
    .required("New Password is required")
    .min(8, "Password must have minimum 8 characters"),
  confirm_password: yup
    .string()
    //@ts-ignore
    .oneOf([yup.ref("new_password"), null], "Passwords must match"),
});

export default function SetNewPassword(props: any) {
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<error>({});
  const history = useHistory();
  const completeNewPassword = useCompleteNewPassword();
  const user = useUser();
  const form = useForm({
    resolver: yupResolver(ChangePswSchema),
  });

  const { handleSubmit } = form;

  const onSubmit = async (data: { new_password: string }) => {
    setLoading(true);
    const { new_password } = data;

    if (user) {
      try {
        await completeNewPassword({
          user: user,
          password: new_password,
        });
        history.push("/login");
      } catch (error: any) {
        setError(error);
      }
    } else {
      history.push("/login");
    }
  };

  return (
    <AuthLayout>
      <div className={classes.formWrapper}>
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
              Please enter your new password below.
            </Typography>
            <div className={classes.inputStyle}>
              <InputField
                name="new_password"
                label="New Password"
                type="password"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <InputField
                name="confirm_password"
                label="Enter New Password Again"
                type="password"
              />
            </div>

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
            >
              {loading ? "Please wait..." : "Change Password"}
            </Button>
          </form>
        </FormProvider>
      </div>
    </AuthLayout>
  );
}
