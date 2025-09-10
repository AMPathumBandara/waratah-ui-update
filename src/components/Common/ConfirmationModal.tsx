import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  title,
  message,
  cancelButtonText = "Cancel",
  confirmButtonText = "Confirm",
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="draggable-dialog-title"
      disableEnforceFocus // This prevents focus trapping
      disableAutoFocus // Optional: Prevents automatic focus on MUI modal
    >
      <DialogTitle
        id="draggable-dialog-title"
        className="confirmation-modal-title"
      >
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText className="confirmation-modal-content">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} className="confirm-btn danger">
          {confirmButtonText}
        </Button>
        <Button autoFocus onClick={onClose} color="default">
          {cancelButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
