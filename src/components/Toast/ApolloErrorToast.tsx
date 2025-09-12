import React from "react";
import { ApolloError } from "@apollo/client";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

interface ErrorToastProps {
  error?: ApolloError;
  processCustomError?: (error: string) => string;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  processCustomError,
}) => {
  const [mutationError, setMutationError] = React.useState<
    ApolloError | undefined
  >(error);

  React.useEffect(() => {
    setMutationError(error);
  }, [error]);

  if (!error) {
    return <></>;
  }
  return (
    <Snackbar
      open={mutationError !== undefined}
      autoHideDuration={6000}
      onClose={() => setMutationError(undefined)}
    >
      <Alert severity="error">
        {mutationError?.graphQLErrors?.map(({ message }, i) => (
          <span key={i}>
            {" "}
            {processCustomError ? processCustomError(message) : message}
          </span>
        ))}
      </Alert>
    </Snackbar>
  );
};

export default ErrorToast;
