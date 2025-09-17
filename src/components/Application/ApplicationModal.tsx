import React from "react";
import { Grid, IconButton } from "@mui/material";
import { Dialog, DialogContent } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useParams, useNavigate } from "react-router-dom";
import { useApplicationStageQuery } from "generated/graphql";
import GridItem from "components/Layout/GridItem";
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";

// const useStyles = makeStyles((theme: Theme) => ({
//   modalWrapper: {
//     "& .MuiDialogContent-root": {
//       minHeight: "60vh",
//       "&::-webkit-scrollbar": {
//         width: 10,
//       },
//       "&::-webkit-scrollbar-track": {
//         backgroundColor: theme.palette.grey[300],
//         borderRadius: "10px",
//       },
//       "&::-webkit-scrollbar-thumb": {
//         backgroundColor: theme.palette.grey[400],
//         borderRadius: "10px",
//       },
//     },
//   },
// }));

interface ApplicationModalProps {
  showModal: boolean;
  setShowModal?: any;
  title?: string;
  children?: any;
}

function ApplicationModal(props: ApplicationModalProps) {
  const { showModal, children } = props;
  console.log(showModal);

  const navigate = useNavigate();

  const theme = useTheme();

  const pageTheme = createTheme(theme, {
    custom: {
      modalWrapper: {
        "& .MuiDialogContent-root": {
          minHeight: "60vh",
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
    }
  });

  const onClose = React.useCallback(() => {
    navigate("/applications");
  }, [history]);

  return (
    <ThemeProvider theme={pageTheme}>
      <div>
        <Dialog
          open={showModal}
          aria-describedby="dialog-description"
          fullWidth={true}
          disableEnforceFocus // This prevents focus trapping
          disableAutoFocus // Optional: Prevents automatic focus on MUI modal
          maxWidth="lg"
          className="modalWrapper"
        >
          <ApplicationModalHeader headerClose={true} setClose={onClose} />
          <DialogContent>{children}</DialogContent>
        </Dialog>
      </div>
    </ThemeProvider>
  );
}
export default React.memo(ApplicationModal);

interface ApplicationModalHeaderProps {
  title?: string;
  headerClose?: boolean;
  setClose?: any;
}

export interface ApplicationParams extends Record<string, string | undefined> {
  id?: string;
}

export const ApplicationTitle = (props: ApplicationModalHeaderProps) => {
  const params = useParams<ApplicationParams>();
  const { data, loading } = useApplicationStageQuery({
    variables: {
      id: params.id,
    },
    fetchPolicy: "cache-only",
  });
  if (loading) {
    return <></>;
  }

  return (
    <>Update - {data?.insurance_application_by_pk?.insured_organization?.name}</>
  );
};

const ApplicationModalHeader: React.FC<ApplicationModalHeaderProps> = props => {
  const params = useParams<ApplicationParams>();

  return (
    <Grid
      container
      spacing={0}
      justifyContent="space-between"
      alignItems="flex-start"
      className="modal-header"
      wrap="nowrap"
    >
      <Grid>
        <GridItem>
          <h4 className="modal-title">
            {!params.id ? props.title : <ApplicationTitle />}
          </h4>
        </GridItem>
      </Grid>
      <Grid>
        <GridItem>
          {props.headerClose && (
            <IconButton
              aria-label="close"
              size="medium"
              className="modal-close"
              onClick={() => props.setClose(true)}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          )}
        </GridItem>
      </Grid>
    </Grid>
  );
};
