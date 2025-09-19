// React Imports
import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { useMachine } from "@xstate/react";
import {
  useParams,
  useNavigate,
  useLocation,
  useMatch,
} from "react-router";
import { Theme } from "@mui/material/styles";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector from "@mui/material/StepConnector";
import Alert, { AlertProps } from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import { StepIconProps } from "@mui/material/StepIcon";
import Check from "@mui/icons-material/Check";
import CircularProgressCore from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/GetApp";
import { applicationStateMachine } from "./Stage";
import {
  ApplicationStageQuery,
  useApplicationStageQuery,
  ConnectedInsuaranceApplicationsQuery,
  useConnectedInsuaranceApplicationsQuery,
  // GetScanStatusSubscription,
  useGetScanStatusQQuery,
  useGetScanStatusSubscription,
  useGetIpfsStatusQQuery,
  useGetIpfsStatusSubscription,
  useGetIpfsFileQuery,
  useGetApplicationPaymentDataQQuery,
  useGetApplicationPaymentDataSubscription,
  useInsuranceArtifactSubscription,
  InsuranceArtifactSubscriptionResult,
  useWatchScanResultSubscription,
  WatchScanResultSubscription,
  WatchScanResultSubscriptionResult
} from "generated/graphql";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { LoadingApplicationSteps } from "components/ContentLoaders";
import ErrorToast from "components/Toast/ErrorToast";
import CircularProgress from "@mui/material/CircularProgress";
import { dowloadInsuredArtifact } from "./downloads";
import { AppBar, Avatar, Box, Chip, Dialog, Divider, List, ListItem, ListItemAvatar, ListItemText, TextField, Toolbar, Typography } from "@mui/material";
import Slide, { SlideProps } from "@mui/material/Slide";
import { Chat, Close, Send } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions/transition";
import { withStyles, makeStyles } from "@mui/styles";
import {
  createTheme,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";

// const useStyles = makeStyles((theme: Theme) => ({
//   container: {
//     // width: "auto",
//     // height: "calc(100vh - 70px)",
//     // display: "grid",
//     // gridTemplateColumns: "1fr",
//     // gridTemplateRows: "80px 1fr",
//     // backgroundColor: theme.palette.background.paper,
//     // overflowY: "auto",
//   },

//   layout: {
//     width: "100%",
//     //maxWidth: "1220px",
//     padding: theme.spacing(2, 0, 4, 0),
//     margin: "0 auto",
//     //paddingTop: theme.spacing(4),
//     //height: "calc(100vh - 150px)",
//     display: "flex",
//     flexDirection: "column",
//     backgroundColor: theme.palette.background.paper,
//   },
//   stepper: {
//     width: "100%",
//     maxWidth: 350,
//     marginLeft: "auto",
//     marginRight: "auto",
//     padding: theme.spacing(0, 0, 1),
//     marginBottom: 25,
//   },
//   buttons: {
//     display: "flex",
//     justifyContent: "space-between",
//   },
//   button: {
//     marginTop: theme.spacing(3),
//     marginLeft: theme.spacing(1),
//   },
//   stepIcon: {
//     display: "flex",
//     justifyContent: "center",
//     height: 50,
//     width: 50,
//     cursor: "pointer",
//   },
//   stepLabel: {
//     marginTop: "8px !important",
//     fontSize: "0.8rem",
//     fontWeight: 600,
//     "&.MuiStepLabel-active": {
//       fontWeight: "600 !important",
//     },
//   },
//   actionBar: {
//     display: "flex",
//     height: 80,
//     width: "calc(100vw - 400px)",
//     alignItems: "center",
//     justifyContent: "center",
//     borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
//     position: "fixed",
//     background: "white",
//     zIndex: 2,
//   },
//   alert: {
//     marginTop: 10,
//   },
//   applicationNavigator: {
//     position: "absolute",
//     left: 100,
//     width: 250,
//   },
//   applicationNavigatorRoot: {
//     fontSize: "0.5rem",
//     "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//       border: "none",
//     },
//   },
//   capitalize: {
//     textTransform: "capitalize",
//   },
//   headerContainer: {
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   primaryText: {
//     fontSize: "1.2em",
//     textTransform: "uppercase",
//     fontWeight: 600,
//   },
//   alertContainer: {
//     width: "100%",
//     paddingLeft: 100,
//     paddingRight: 100,
//     paddingTop: 10,
//   },
//   alertPadding: {
//     paddingTop: 1,
//     paddingBottom: 1,
//   },
//   downloadContainer: {
//     position: "absolute",
//     right: 135,
//     cursor: "pointer",
//   },
//   searchboxLabel: {
//     "& .MuiFormLabel-root": {
//       color: "lightgray",
//       "& .Mui-focused": {
//         color: theme.palette.primary.main,
//       },
//     },
//     "& .MuiFormLabel-root.Mui-focused": {
//       color: theme.palette.primary.main,
//     },
//   },
//   hidden: {
//     display: "none",
//   },
//   btnBox: {
//     display: "flex",
//     gap: "5px",
//   },
// }));

const capitalize = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getFileName = (str: string, type: string) => {
  if (!str) return str;
  // support old policy file names
  if (type === "policy" && !str.includes("Policy")) {
    return "Policy";
  }
  return str.split("/").pop();
}

const useColorlibStepIconStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 40,
    height: 40,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    backgroundColor: theme.palette.primary.main,
  },
  completed: {
    backgroundColor: theme.palette.primary.main,
  },
  label: {
    fontSize: "1rem",
  },
}));

const QontoConnector = withStyles((theme: Theme) => ({
  alternativeLabel: {
    top: 20,
    left: "calc(-50% + 25px)",
    right: "calc(50% + 25px)",
  },
  active: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.primary.main,
    },
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}))(StepConnector);

const CustomStepIcon = (props: StepIconProps) => {
  const classes = useColorlibStepIconStyles();
  const { active, completed } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: completed ? (
      <Check fontSize="small" className={classes.completed} />
    ) : (
      <div className={classes.label}>1</div>
    ),
    2: completed ? (
      <Check fontSize="small" className={classes.completed} />
    ) : (
      <div className={classes.label}>2</div>
    ),
    3: completed ? (
      <Check fontSize="small" className={classes.completed} />
    ) : (
      <div className={classes.label}>3</div>
    ),
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
};

const steps = ["Profile", "Quote", "Bound"];
export interface ApplicationParams extends Record<string, string | undefined> {
  id?: string;
}

interface InsuredDetailsProps {
  applicationData?: ApplicationStageQuery;
  applicationList?: ConnectedInsuaranceApplicationsQuery;
  handleChangeInsurance?: (event: React.ChangeEvent<{}>, value: any) => void;
}

interface ScanAlertProps {
  status: String;
}

function withExtraInfo<P>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithExtraInfo = (props: P) => {
    const params = useParams<ApplicationParams>();
    const { data, loading } = useApplicationStageQuery({
      variables: {
        id: params.id,
      },
    });

    const {
      data: insuanceApplicationList,
      loading: insuanceApplicationListLoading,
    } = useConnectedInsuaranceApplicationsQuery({
      variables: {
        id: params.id,
      },
    });

    return loading || insuanceApplicationListLoading ? (
      <LoadingApplicationSteps />
    ) : (
      <WrappedComponent
        {...props}
        applicationData={data}
        applicationList={insuanceApplicationList}
      />
    );
  };
  return ComponentWithExtraInfo;
}

export function InsuredDetails(props: InsuredDetailsProps) {
  const params = useParams<ApplicationParams>();

  const Component = params.id
    ? withExtraInfo(InsuredDetailsComponent)
    : InsuredDetailsComponent;

  return <Component {...props} />;
}

function BaseAlert(props: AlertProps) {
  //const classes = useStyles();
  return <Alert sx={(theme: Theme) => theme.custom.alertPadding} elevation={6} {...props} />;
}

const ScanAlert: React.FC<ScanAlertProps> = ({ status }) => {
  status = status?.toUpperCase();
  switch (status) {
    case "PENDING":
    case "RUNNING":
      return (
        <BaseAlert severity="info" icon={false}>
          {" "}
          <CircularProgressCore size={15} inlist="true" /> Scan in progress{" "}
        </BaseAlert>
      );
    case "SUCCESS":
      return <BaseAlert severity="success">Scan completed</BaseAlert>;
    case "ERROR":
      return <BaseAlert severity="error">Errors in scan</BaseAlert>;
    case "IPFS_DONE":
      return <BaseAlert severity="info">Policy Created </BaseAlert>;
    case "IPFS_ISSUED":
      return <BaseAlert severity="info">Policy Issued </BaseAlert>;
    default:
      return (
        <BaseAlert severity="error">
          Errors in scan - Scan not initiated{" "}
        </BaseAlert>
      );
  }
};

const MachineContext = React.createContext({});

const InsuredDetailsComponent: React.FC<InsuredDetailsProps> = ({
  applicationData,
  applicationList,
}) => {
  //const classes = useStyles();

  const theme = useTheme();

  const pageTheme = createTheme(theme, {
    custom: {
      container: {
        // width: "auto",
        // height: "calc(100vh - 70px)",
        // display: "grid",
        // gridTemplateColumns: "1fr",
        // gridTemplateRows: "80px 1fr",
        // backgroundColor: theme.palette.background.paper,
        // overflowY: "auto",
      },

      layout: {
        width: "100%",
        //maxWidth: "1220px",
        padding: theme.spacing(2, 0, 4, 0),
        margin: "0 auto",
        //paddingTop: theme.spacing(4),
        //height: "calc(100vh - 150px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
      },
      stepper: {
        width: "100%",
        maxWidth: 350,
        marginLeft: "auto",
        marginRight: "auto",
        padding: theme.spacing(0, 0, 1),
        marginBottom: 25,
      },
      buttons: {
        display: "flex",
        justifyContent: "space-between",
      },
      button: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(1),
      },
      stepIcon: {
        display: "flex",
        justifyContent: "center",
        height: 50,
        width: 50,
        cursor: "pointer",
      },
      stepLabel: {
        marginTop: "8px !important",
        fontSize: "0.8rem",
        fontWeight: 600,
        "&.MuiStepLabel-active": {
          fontWeight: "600 !important",
        },
      },
      actionBar: {
        display: "flex",
        height: 80,
        width: "calc(100vw - 400px)",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        position: "fixed",
        background: "white",
        zIndex: 2,
      },
      alert: {
        marginTop: 10,
      },
      applicationNavigator: {
        position: "absolute",
        left: 100,
        width: 250,
      },
      applicationNavigatorRoot: {
        fontSize: "0.5rem",
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
          border: "none",
        },
      },
      capitalize: {
        textTransform: "capitalize",
      },
      headerContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
      },
      primaryText: {
        fontSize: "1.2em",
        textTransform: "uppercase",
        fontWeight: 600,
      },
      alertContainer: {
        width: "100%",
        paddingLeft: 100,
        paddingRight: 100,
        paddingTop: 10,
      },
      alertPadding: {
        paddingTop: 1,
        paddingBottom: 1,
      },
      downloadContainer: {
        position: "absolute",
        right: 135,
        cursor: "pointer",
      },
      searchboxLabel: {
        "& .MuiFormLabel-root": {
          color: "lightgray",
          "& .Mui-focused": {
            color: theme.palette.primary.main,
          },
        },
        "& .MuiFormLabel-root.Mui-focused": {
          color: theme.palette.primary.main,
        },
      },
      hidden: {
        display: "none",
      },
      btnBox: {
        display: "flex",
        gap: "5px",
      },
    }
  });

  const navigate = useNavigate();
  const params = useParams<ApplicationParams>();
  const [quoteDownloadLoading, setQuoteDownloadLoading] = useState(false);

  const [currentStage, setCurrentStage] = useState(
    applicationData?.insurance_application_by_pk?.stage || "profile"
  );

  const location = useLocation();
  //let { path } = useRouteMatch();

  if (applicationData?.insurance_application_by_pk === null) {
    navigate("/page-not-found");
  }
  const domainData = location ? { ...location.state } : {};

  const applicationId =
    applicationData?.insurance_application_by_pk?.id || undefined;

  const scanQuery = useGetScanStatusQQuery({
    variables: {
      id: applicationId,
    },
    skip: !applicationId,
  });
  const scanSubscription = useGetScanStatusSubscription({
    variables: {
      id: applicationId,
    },
    skip: scanQuery.data?.external_scan[0]
      ? scanQuery.data?.external_scan[0].status === "SUCCESS"
      : false,
  });

  const {
    data: scanData,
    loading: scanLoading,
    error: scanDataError,
  } = scanSubscription.data ? scanSubscription : scanQuery;

  // Ipfs policy

  const ipfsQuery = useGetIpfsStatusSubscription({
    variables: {
      applicationId: applicationId,
    },
    skip: !applicationId,
  });

  const ipfsSubscription = useGetIpfsStatusQQuery({
    variables: {
      applicationId: applicationId,
    },
    skip: !applicationId || ipfsQuery.data?.insurance_policy[0] ? true : false,
  });

  const {
    data: ipfsData,
    loading: ipfsLoading,
    error: ipfsError,
  } = ipfsSubscription.data ? ipfsSubscription : ipfsQuery;

  const report =
    applicationData?.insurance_application_by_pk?.insurance_quote_selection
      ?.insurance_policy?.waratah_report;

  const {
    data: fileData,
    loading: fileLoading,
    error: fileError,
    refetch: fileRefetch,
  } = useGetIpfsFileQuery({
    variables: {
      filename: report ? `${report}.pdf` : "",
    },
    //skip: report ? false : true,
    skip: true,
  });

  const paymentDataQuery = useGetApplicationPaymentDataQQuery({
    variables: {
      id: params.id,
    },
    skip: !params.id,
  });

  const paymentDataSubscription = useGetApplicationPaymentDataSubscription({
    variables: {
      id: params.id,
    },
    skip: paymentDataQuery?.data?.insurance_policy[0]
      ? paymentDataQuery?.data?.insurance_policy[0].agent_signed &&
        paymentDataQuery?.data?.insurance_policy[0].insured_signed &&
        paymentDataQuery?.data?.insurance_policy[0].payment_collected
        ? true
        : false
      : false,
  });

  const artifactDataSubscription = useInsuranceArtifactSubscription({
    variables: {
      applicationId: params.id,
    },
    skip: !params.id
  });

  const watchScanResultSubscription = useWatchScanResultSubscription({
    variables: {
      applicationId: params.id
    },
    skip: !params.id
  });

  const { data: applicationPaymentData, error: applicationPaymentError } =
    paymentDataSubscription?.data ? paymentDataSubscription : paymentDataQuery;

  const waratahReportPath =
    applicationPaymentData?.insurance_policy[0]?.waratah_report || undefined;

  const applicationStageMachine = applicationStateMachine(currentStage);
  const machine = useMachine(applicationStageMachine, {});

  const currentStepData = applicationStageMachine.states[currentStage]?.meta;
  const CurrentComponent = currentStepData?.component || React.Fragment;

  //  TODO : We should leverage the state machine as oppose to local state for transitions

  const handleStageChange = (stage: string) => {
    setCurrentStage(stage);
  };

  const [showQuotesList, setShowQuotesLists] =
    React.useState<null | HTMLElement>(null);
  const quotesHandleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowQuotesLists(event.currentTarget);
  };
  const quotesHandleClose = () => {
    setShowQuotesLists(null);
  };

  const handleStepChange = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (
      currentStage ===
      event.currentTarget.getAttribute("data-label")?.toLowerCase()
    ) {
      return false;
    }
    if (currentStage === "bound") {
      setCurrentStage(
        event.currentTarget.getAttribute("data-label")?.toLowerCase()!
      );
    } else if (currentStage === "quote" || currentStage === "declined") {
      const newState = event.currentTarget
        .getAttribute("data-label")
        ?.toLowerCase()!;
      if (newState === "profile") setCurrentStage(newState);
    }
  };

  const changeApplication = (id: any) => {
    navigate(`/applications/${id}`);
  };
  const disableRelatedQuote =
    applicationList?.insurance_application === undefined ||
      applicationList?.insurance_application?.length <= 1
      ? true
      : false;

  const hideStateMachine =
    ipfsData?.insurance_policy[0]?.stage === "issued" ||
      ipfsData?.insurance_policy[0]?.stage === "error"
      ? true
      : false;

  if (
    applicationPaymentError?.message.includes(
      "invalid input syntax for type uuid"
    )
  ) {
    navigate("/page-not-found");
  }
  return (
    <>
      <ThemeProvider theme={pageTheme}>
        <ErrorToast
          error={fileError}
          processCustomError={() =>
            `Scan report download - ${fileError?.message}`
          }
        />
        <ErrorToast
          error={applicationPaymentError}
          processCustomError={() =>
            `Application payment Data - ${applicationPaymentError?.message}`
          }
        />
        <ErrorToast
          error={scanDataError}
          processCustomError={() => `Scan Error - ${scanDataError?.message}`}
        />
        <ErrorToast
          error={ipfsError}
          processCustomError={() => `IPFS - ${ipfsError?.message}`}
        />
        <MachineContext.Provider value={machine}>
          <Box sx={(theme: Theme) => theme.custom.container}>
            <Box sx={(theme: Theme) => theme.custom.layout}>
              {!hideStateMachine && (
                <Stepper
                  activeStep={currentStepData?.index}
                  sx={(theme: Theme) => theme.custom.stepper}
                  alternativeLabel
                  connector={<QontoConnector />}
                >
                  {steps.map(label => (
                    <Step
                      key={label}
                      onClick={handleStepChange}
                      sx={(theme: Theme) => theme.custom.stepIcon}
                      data-label={label}
                    >
                      <StepLabel
                        StepIconComponent={CustomStepIcon}
                        StepIconProps={{
                          classes: { root: theme.custom.stepIcon },
                        }}
                        classes={{
                          label: theme.custom.stepLabel,
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              <div className="alerts-bar">
                <DisplayScanAlert stage={ipfsData?.insurance_policy[0]} />
                {/* {ipfsData?.insurance_policy[0] &&
                (currentStage === "bound" || currentStage === "issued") &&
                ipfsData?.insurance_policy[0].stage !== "error" &&
                (currentStage === "bound" ? (
                  <ScanAlert status={"IPFS_DONE"} />
                ) : (
                  <ScanAlert status={"IPFS_ISSUED"} />
                ))} */}
                {/* {currentStage === "quote" && scanData?.external_scan[0] && (
                  <ScanAlert status={scanData?.external_scan[0].status!} />
                )} */}
                {applicationData?.insurance_application_by_pk?.stage ===
                  "declined" ? (
                  <Alert severity="error">This Application Declined!</Alert>
                ) : (
                  <></>
                )}
              </div>

              <div className="application-action-bar">
                <div className="related-quotes">
                  <Tooltip
                    title={
                      disableRelatedQuote ? "Not available" : "Related Quotes"
                    }
                    aria-label="add"
                  >
                    <div className="downloads">
                      <IconButton
                        aria-label="related-quote"
                        size="medium"
                        disabled={disableRelatedQuote}
                        onClick={quotesHandleClick}
                      >
                        Related Quotes
                      </IconButton>

                      <Menu
                        className="downloads-options"
                        id="related-quote"
                        anchorEl={showQuotesList}
                        open={Boolean(showQuotesList)}
                        onClose={quotesHandleClose}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        MenuListProps={{
                          "aria-labelledby": "related-quote",
                        }}
                      >
                        {applicationList?.insurance_application?.map(q => (
                          <MenuItem
                            key={q.id}
                            onClick={() => changeApplication(q.id)}
                          >
                            {q.effective_date} - {q.expiration_date}
                          </MenuItem>
                        ))}
                      </Menu>
                    </div>
                  </Tooltip>
                </div>
                <Box sx={(theme: Theme) => theme.custom.btnBox}>
                  <ChatWindow
                  />
                  <DownloadOptions
                    fileRefetch={fileRefetch}
                    waratahReportPath={waratahReportPath}
                    artifactDataSubscription={artifactDataSubscription}
                    watchScanResultSubscription={watchScanResultSubscription}
                    quoteDownloadLoading={quoteDownloadLoading}
                  />
                </Box>
              </div>

              <CurrentComponent
                handleStageChange={handleStageChange}
                selectedQuoteId={
                  applicationData?.insurance_application_by_pk
                    ?.insurance_quote_selection?.quote_id
                }
                applicationStage={
                  applicationData?.insurance_application_by_pk?.stage
                }
                brokerName={
                  applicationData?.insurance_application_by_pk
                    ?.insured_organization?.broker_agency?.name
                }
                riskScore={
                  scanData?.external_scan[0]
                    ? scanData?.external_scan[0].risk_score
                      ? scanData?.external_scan[0].risk_score
                      : -1
                    : -1
                }
                scanData={scanData}
                scanLoading={scanLoading}
                policyData={ipfsData?.insurance_policy[0]}
                domainData={domainData}
                applicationPaymentData={applicationPaymentData}
                artifactDataSubscription={artifactDataSubscription}
                fileRefetch={fileRefetch}
                setQuoteDownloadLoading={setQuoteDownloadLoading}
              />
            </Box>
          </Box>
        </MachineContext.Provider>
      </ThemeProvider>
    </>
  );
};

export default InsuredDetails;

interface downloadOptions {
  fileRefetch: any;
  waratahReportPath: string | undefined;
  applicationId?: string;
  artifactDataSubscription: InsuranceArtifactSubscriptionResult;
  watchScanResultSubscription: WatchScanResultSubscriptionResult;
  quoteDownloadLoading: boolean;
}

const DownloadOptions = (props: downloadOptions) => {
  const { fileRefetch, waratahReportPath, artifactDataSubscription, watchScanResultSubscription, quoteDownloadLoading } = props;

  const [showDownloads, setShowDownloads] = React.useState<null | HTMLElement>(
    null
  );
  const [loadingScanRepDownload, setLoadingScanRepDownload] = useState(false);
  const [showTooltip, setShowToolTip] = useState(false);

  const scan_result = watchScanResultSubscription?.data?.external_scan[0]?.scan_result?.verdict;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowDownloads(event.currentTarget);
  };
  const handleClose = () => {
    setShowDownloads(null);
  };

  const scanReportDownload = async (file_type: string, file_uri: string) => {
    setLoadingScanRepDownload(true);

    await dowloadInsuredArtifact(fileRefetch, file_uri, file_type, () => {
      setLoadingScanRepDownload(false);
    });

  };

  // useEffect(() => {
  //   if (scan_result) {
  //     setShowToolTip(scan_result === 'pending');
  //   }
  // }, [scan_result]);

  console.log(artifactDataSubscription.loading);

  if (artifactDataSubscription.loading) {
    return <CircularProgress style={{ marginLeft: 5 }} size={18} />;
  }

  const handleToolTip = (isMouseOver: boolean): void => {
    if (scan_result && scan_result !== 'pending') {
      setShowToolTip(isMouseOver);
    }
  }

  return (
    <Tooltip
      title={(scan_result === 'pending') ? "Waiting for scan data..." : "Downloads"}
      // open={showTooltip}
      // onMouseEnter={() => handleToolTip(true)}
      // onMouseLeave={() => handleToolTip(false)}
      aria-label="add">
      <div className="downloads">
        <IconButton
          aria-label="download"
          size="medium"
          onClick={handleClick}
          // onMouseEnter={() => handleToolTip(true)}
          // onMouseLeave={() => handleToolTip(false)}
          disabled={
            quoteDownloadLoading
              //|| (!scan_result || (scan_result === 'pending' || scan_result === 'failed' || scan_result === 'reject')) 
              ? true : false
          }
        //disabled={downloadFilePath ? false : true}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>

        <Menu
          className="downloads-options"
          id="basic-menu"
          anchorEl={showDownloads}
          open={Boolean(showDownloads)}
          onClose={handleClose}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          MenuListProps={{
            "aria-labelledby": "download",
          }}
        >
          {
            artifactDataSubscription.data?.insurance_application_artifact.map((artifact, index) => {
              return (
                <MenuItem
                  key={`artifact-${artifact.id}`}
                  disabled={
                    loadingScanRepDownload
                  }
                  onClick={() => scanReportDownload(
                    getFileName(artifact.file_uri as string, artifact.file_type as string)?.replace(".pdf", "") as string,
                    artifact.file_uri as string
                  )}
                >
                  <div className="flex flex-row justify-between">
                    <div>
                      {getFileName(artifact.file_uri as string, artifact.file_type as string)?.replace(".pdf", "")}
                      {/* {
                        index === 0 && (
                          <Chip 
                            label="latest" 
                            color="primary" 
                            style={{
                              marginLeft: "6px",
                              height: "20px",
                              padding: "9px 0",
                              position: "relative",
                              top: "-2px"
                            }}
                          />
                        )
                      } */}
                    </div>
                    <div style={{ width: 25 }}>
                      {loadingScanRepDownload && (
                        <CircularProgress style={{ marginLeft: 5 }} size={18} />
                      )}
                    </div>
                  </div>
                </MenuItem>
              );
            })
          }
          {/* <MenuItem
            disabled={
              waratahReportPath ? false : true || loadingScanRepDownload
            }
            onClick={() => scanReportDownload()}
          >
            <div className="flex flex-row justify-between">
              <div>Download Policy</div>
              <div style={{ width: 25 }}>
                {loadingScanRepDownload && (
                  <CircularProgress style={{ marginLeft: 5 }} size={18} />
                )}
              </div>
            </div>
          </MenuItem> */}
        </Menu>
      </div>
    </Tooltip>
  );
};

const DisplayScanAlert = (props: any) => {
  const { stage } = props;
  if (stage === undefined) {
    return <></>;
  }
  switch (stage.stage) {
    case "issued":
      return <ScanAlert status={"IPFS_ISSUED"} />;
    case "created":
      return <ScanAlert status={"IPFS_DONE"} />;
    default:
      return <></>;
  }
};

interface chatWindowOptions {
}

// Slide transition from bottom
const Transition = React.forwardRef<HTMLDivElement, SlideProps>(function Transition(
  props,
  ref
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const ChatWindow = (props: chatWindowOptions) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([
    { user: "Broker", text: "Hi, can you check this quote?" },
    { user: "Underwriter", text: "Sure, let me take a look." }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { user: "Me", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <>
      <Tooltip
        title={(open ? "Close" : "Open") + " Chat"}
        aria-label="Chat"
      >
        <div className="downloads">
          <IconButton
            aria-label="Chat"
            size="medium"
            onClick={handleOpen}
          >
            <Chat fontSize="small" />
          </IconButton>
        </div>
      </Tooltip>

      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick" || reason === "escapeKeyDown") {
            return; // ignore
          }
          handleClose();
        }}
        disableEscapeKeyDown
        TransitionComponent={Transition}
        keepMounted
        hideBackdrop
        PaperProps={{
          style: {
            position: "fixed",
            margin: 0,
            bottom: 80, // above FAB
            right: 20,
            width: 350,
            height: "60vh",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
          }
        }}
        BackdropProps={{ invisible: true }}
      >
        <AppBar
          position="static"
          color="primary"
          style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Chat
            </Typography>
            <IconButton edge="end" color="inherit" onClick={handleClose}>
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box style={{ flex: 1, overflowY: "auto" }}>
          <List>
            {
              messages.map((msg, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>{msg.user.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={msg.user} secondary={msg.text} />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            }
          </List>
        </Box>

        <Box display="flex" p={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <IconButton color="primary" onClick={handleSend}>
            <Send />
          </IconButton>
        </Box>
      </Dialog>
    </>
  );
};
