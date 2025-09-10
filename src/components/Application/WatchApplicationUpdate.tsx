import React from "react";
import { useWatchUpdateApplicationsSubscription } from "generated/graphql";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import RefreshIcon from "@mui/icons-material/Refresh";

let stage: string | null | undefined = "";
let applicationId: string = "";

function WatchApplicationUpdate(props: any) {
  const { loading, data: watchUpdate } =
    useWatchUpdateApplicationsSubscription();

  const subscriptionData =
    watchUpdate?.latest_insurance_applications[0] || null;

  if (loading) {
    return <></>;
  }

  if (stage === "" && applicationId === "") {
    stage = subscriptionData?.stage;
    applicationId = subscriptionData?.id;
  }
  if (
    applicationId !== subscriptionData?.id ||
    stage !== subscriptionData?.stage
  ) {
    return (
      <Snackbar open={true} className="application-watch-alert">
        <Alert
          severity="warning"
          elevation={6}
          variant="filled"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => window.location.reload()}
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <span>
            The content on this page may have been updated, please refresh the
            page.
          </span>
        </Alert>
      </Snackbar>
    );
  } else {
    return <></>;
  }
}

export default React.memo(WatchApplicationUpdate);
