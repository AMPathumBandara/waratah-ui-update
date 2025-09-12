import React from "react";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import theme from "theme/theme";
import GridItem from "components/Layout/GridItem";

interface ReportProps {
  open: boolean;
  handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

const useStyles = makeStyles(() => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    outline: "none",
    height: 400,
    width: 600,
  },
  container: {
    padding: theme.spacing(0, 4, 4),
    display: "flex",
    flexDirection: "column",
    height: 320,
  },
  titleBar: {
    backgroundColor: theme.palette.primary.main,
    height: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "uppercase",
    color: "white",
    fontSize: "1.5em",
  },
  gridContainer: {
    marginTop: theme.spacing(5),
  },
  buttonContainer: {
    marginTop: "auto",
    display: "flex",
  },
  submit: {
    marginLeft: "auto",
  },
}));

const Report: React.FC<ReportProps> = ({ open, handleClose }) => {
  const classes = useStyles();

  return (
    <Modal
      // aria-labelledby="transition-modal-title"
      // aria-describedby="transition-modal-description"
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <div className={classes.titleBar}>Create Reports</div>
          <div className={classes.container}>
            <p id="transition-modal-description">
              Select the date range for the report
            </p>
            <Grid container spacing={3} className={classes.gridContainer}>
              <Grid size={{ xs: 6 }}>
                <GridItem>
                  <TextField
                    required
                    name="from_date"
                    label="From"
                    type="date"
                    // defaultValue={
                    // data?.insurance_application_by_pk?.effective_date
                    // }
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  // inputRef={register}
                  // onChange={handleOnChangeEffectiveDate}
                  />
                </GridItem>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <GridItem>
                  <TextField
                    required
                    name="to_date"
                    label="To"
                    type="date"
                    // defaultValue={
                    // data?.insurance_application_by_pk?.effective_date
                    // }
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  // inputRef={register}
                  // onChange={handleOnChangeEffectiveDate}
                  />
                </GridItem>
              </Grid>
            </Grid>
            <div className={classes.buttonContainer}>
              <Button
                type="submit"
                // variant="contained"
                color="primary"
              // disabled={
              // !(
              //     (dateSelected ||
              //     data?.insurance_application_by_pk?.effective_date !==
              //         null) &&
              //     activeQuoteId !== 0
              // ) ||
              // updateLoading ||
              // deleteLoading ||
              // applicationStage === "declined" ||
              // riskScore < 0
              // }
              // onClick={handleSubmitOnClick}
              >
                Close
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                // disabled={
                // !(
                //     (dateSelected ||
                //     data?.insurance_application_by_pk?.effective_date !==
                //         null) &&
                //     activeQuoteId !== 0
                // ) ||
                // updateLoading ||
                // deleteLoading ||
                // applicationStage === "declined" ||
                // riskScore < 0
                // }
                // onClick={handleSubmitOnClick}
                className={classes.submit}
              >
                Create Report
              </Button>
            </div>
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export default Report;
