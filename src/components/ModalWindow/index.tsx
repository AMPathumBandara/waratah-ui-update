import { Grid, IconButton } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { CallMissedSharp } from "@mui/icons-material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
import theme from "theme/theme";
import CloseIcon from "@mui/icons-material/Close";
import GridItem from "components/Layout/GridItem";

const useStyles = makeStyles((theme: Theme) => ({
  modalHeader: {
    borderBottom: "1px solid #e6e6e6",
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    "& .modal-title": {
      color: theme.palette.grey[800],
    },
  },
  modalClose: {
    position: "relative",
    right: -15,
    top: 7,
  },
  modalWrapper: {
    "& .MuiDialogContent-root": {
      "&::-webkit-scrollbar": {
        width: 10,
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: theme.palette.grey[300],
        borderRadius: "10px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.grey[400],
        borderRadius: "10px",
      },
    },
  },
  modalContentWrapper: {
    padding: theme.spacing(3, 3, 3),
  },
}));

interface ApplicationModalProps {
  showModal: boolean;
  setShowModal?: any;
  title?: string;
  children?: any;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function ModalWindow(props: ApplicationModalProps) {
  const { showModal, setShowModal, title, children, size } = props;
  const classes = useStyles();
  return (
    <div>
      <Dialog
        open={showModal}
        aria-describedby="dialog-description"
        fullWidth={true}
        maxWidth={size ? `${size}` : `md`}
        className={classes.modalWrapper}
        disableEnforceFocus // This prevents focus trapping
        disableAutoFocus // Optional: Prevents automatic focus on MUI modal
      >
        <ApplicationModalHeader
          title={title}
          headerClose={true}
          setClose={() => setShowModal(false)}
        />
        <DialogContent className={classes.modalContentWrapper}>
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ApplicationModalHeaderProps {
  title?: string;
  headerClose?: boolean;
  setClose?: any;
}

const ApplicationModalHeader: React.FC<ApplicationModalHeaderProps> = props => {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        spacing={0}
        justifyContent="space-between"
        alignItems="flex-start"
        className={classes.modalHeader}
        wrap="nowrap"
      >
        <Grid>
          <GridItem>
            <h4 className="modal-title">{props.title}</h4>
          </GridItem>
        </Grid>
        <Grid>
          <GridItem>
            {props.headerClose && (
              <IconButton
                aria-label="close"
                size="medium"
                className={classes.modalClose}
                onClick={() => props.setClose(true)}
              >
                <CloseIcon fontSize="medium" />
              </IconButton>
            )}
          </GridItem>
        </Grid>
      </Grid>
    </>
  );
};
