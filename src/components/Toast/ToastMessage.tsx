import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface ToastMessageProps {
  message?: string;
  show?: any;
  hide?: any;
  children?: any;
  type?: "warning" | "error" | "info" | "success";
  autoHide?: boolean;
  positionVertical?: "top" | "bottom";
  positionHorizontal?: "right" | "left" | "center";
  outSideClickHide?: boolean;
  autoHideTime?: number;
}
export default function ToastMessage(props: ToastMessageProps) {
  const {
    message,
    show,
    hide,
    type,
    autoHide,
    positionVertical,
    positionHorizontal,
    outSideClickHide,
    autoHideTime = 6000
  } = props;

  //const autoHideTime = 6000;

  setTimeout(() => {
    if (show && autoHide) {
      console.log("autoHiding...");
      hide(false);
    }
  }, autoHideTime);

  return (
    <Snackbar
      open={show}
      autoHideDuration={autoHide ? autoHideTime : null}
      onClose={() => {
        if (outSideClickHide) {
          hide(false);
        }
      }}
      anchorOrigin={{
        vertical: positionVertical || "bottom",
        horizontal: positionHorizontal || "center",
      }}
    >
      <Alert
        severity={type}
        elevation={6}
        variant="filled"
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => hide(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <span>{message}</span>
      </Alert>
    </Snackbar>
  );
}
