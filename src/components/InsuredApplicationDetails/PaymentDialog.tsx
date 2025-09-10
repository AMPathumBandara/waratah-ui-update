import React from "react";
import { makeStyles, Theme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Style
const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textDecoration: "none",
  },
}));

// Interfaces
interface PaymentDialogProps {
  open: boolean;
  handleClose: () => void;
  agentUrl: string | undefined;
  insuredUrl: string | undefined;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  handleClose,
  agentUrl,
  insuredUrl,
}) => {
  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="payment" 
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle id="form-dialog-title">
        Payment Documentation Created
      </DialogTitle>
      <DialogContent>
        <p>
          Premium Finance documentation created successfully.{" "}
          <strong>Note:</strong> Policies being paid in full will NOT require an
          additional signature from the insured. This policy will not be issued
          until payment and required signatures are received. Please proceed to
          payment collection.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        {/* <a className={classes.link} href={insuredUrl}>
          <Button onClick={handleClose} color="primary" variant="contained">
            Collect Payment
          </Button>
        </a> */}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
