// React Imports
import React, { createRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Material UI
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { lighten } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CopyIcon from "icons/copy-icon.svg";
// Local imoprts
import {
  useSummaryInsuranceApplicationQuery,
  useBindApplicationMutation,
  GetApplicationPaymentDataQQuery,
  useWatchSummaryInsuranceApplicationSubscription,
  useAgentBindApplicationMutation
} from "generated/graphql";
import { ApplicationParams } from "./index";
import FeatureFlag from "utils/FeatureFlag";
import PaymentDialog from "components/InsuredApplicationDetails/PaymentDialog";
import Card from "components/Layout/Card";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ButtonsContainer from "components/Layout/ButtonsContainer";
import {
  LoadingBindStatus,
  LoadingBindTableInfor,
} from "components/ContentLoaders";
import ErrorToast from "components/Toast/ErrorToast";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import {
  AgentSignedIcon,
  AgentUnSignedIcon,
  currencyFormatter,
  currencyFormatterWithCents,
  InsuredSignedIcon,
  InsuredUnSignedIcon,
  PaymentCollectedIcon,
  PaymentNotCollectedIcon,
} from "utils";
import ScanVerdictDetailModal from "./ScanVerdictDetail";
import { useUser } from "components/Auth/CognitoHooks";
import IconButton from "@mui/material/IconButton/IconButton";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import GridItem from "components/Layout/GridItem";

// Styles
const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "1fr",
    paddingLeft: 100,
    paddingRight: 100,
    paddingBottom: 100,
  },
  buttons: {
    borderTop: "1px solid #b3b7bd",
    position: "fixed",
    bottom: 0,
    left: 400,
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    width: "calc(100vw - 400px)",
    display: "flex",
    backgroundColor: "#b3b7bd",
  },
  buttonContainer: {
    marginLeft: "auto",
    marginRight: 190,
  },
  button: {
    marginRight: theme.spacing(1),
  },
  marginTop: {
    marginTop: 40,
  },
  borderRight: {
    borderRight: "1px solid black",
  },
  fontLight: {
    color: lighten(theme.palette.text.primary, 0.6),
  },
  gridRow: {
    marginBottom: "0.8rem",
    wordBreak: "break-all",
  },
  hidden: {
    display: "none",
  },
  link: {
    textDecoration: "none",
  },
  bind: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "blue",
    marginLeft: "auto",
  },
  paymentContainer: {
    display: "flex",
    flexDirection: "column",
  },
  paymentButton: {
    height: 60,
    marginBottom: theme.spacing(2),
    maxWidth: 400,
    margin: "0 auto",
  },
  checkContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  bindBadgeWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0 0.8rem",
  },
}));

// Percentile function
const getPercentile = (number: number) => {
  if (number === 0 || isNaN(number)) {
    return "N/A";
  }
  const j = number % 10;
  if (j === 1 && number !== 11) {
    return number + "st Percentile";
  }
  if (j === 2 && number !== 12) {
    return number + "nd Percentile";
  }
  if (j === 3 && number !== 13) {
    return number + "rd Percentile";
  }
  return number + "th Percentile";
};

//Interfaces
interface GridRowProps {
  name: string;
  value: any;
}

interface BindProps {
  handleStageChange: (stage: string) => void;
  applicationPaymentData: GetApplicationPaymentDataQQuery;
  policyData?: {
    policy_number?: string;
    ipfs_report?: string;
    stage?: string;
    electronic_signature_url?: string;
    ipfs_quote_data?: {
      QuoteNumber?: string;
      Premium?: string;
      DownAmount?: string;
      AmountFinanced?: string;
      FinanceCharge?: string;
      TotalPayments?: string;
      PaymentAmount?: string;
      DocStamp?: string;
      FirstDueDate?: string;
      APR?: string;
      Installments?: string;
      BatchID?: string;
      PaymentsRetained?: string;
      PaymentRetainedAmount?: string;
      RetailAgentRegisterLoginURL?: {};
      ESignResult?: {
        "e-Sign_Option"?: string;
        BatchID?: string;
        AgentURL?: {
          $?: string;
        };
        InsuredURL?: {
          $?: string;
        };
      };
    };
    waratah_report: string;
  };
}

interface CheckmarkProps {
  statusType: any;
  status: boolean | null | undefined;
}

const GetStatusIcon: React.FC<CheckmarkProps> = ({ statusType, status }) => {
  switch (statusType) {
    case "agent_signed":
      return status ? <AgentSignedIcon /> : <AgentUnSignedIcon />;

    case "insured_signed":
      return status ? <InsuredSignedIcon /> : <InsuredUnSignedIcon />;
    case "payment":
      return status ? <PaymentCollectedIcon /> : <PaymentNotCollectedIcon />;

    default:
      return <></>;
  }
};

// Grid Row Component
const GridRow: React.FC<GridRowProps> = ({ name, value }) => {
  const classes = useStyles();
  return (
    <>
      <Grid sx={{ sm: 6, xs: 12 }}>
        <GridItem>
          <Typography
            variant="body2"
            className={`${classes.fontLight} ${classes.gridRow}`}
          >
            {name}
          </Typography>
        </GridItem>
      </Grid>
      <Grid sx={{ sm: 6, xs: 12 }}>
        <GridItem>
          <Typography variant="body2" align="right" className={classes.gridRow}>
            {value}
          </Typography>
        </GridItem>
      </Grid>
    </>
  );
};

const Bind: React.FC<BindProps> = ({
  handleStageChange,
  policyData,
  applicationPaymentData,
}) => {
  const classes = useStyles();

  const [bindDialog, setBindDialog] = useState(false);

  const params = useParams<ApplicationParams>();

  const loggedUser = useUser();

  const [showScanVerdict, setShowScanVerdict] = useState(false);

  const [bindInsuranceApplication, { loading: bindLoading, error: bindError }] =
    useBindApplicationMutation({
      errorPolicy: "all",
    });

  const [agentBindInsuranceApplication, { loading: agentBindLoading, error: agentBindError }] =
    useAgentBindApplicationMutation({
      errorPolicy: "all",
    });

  const useSummaryData = useSummaryInsuranceApplicationQuery({
    variables: {
      id: params.id,
    },
  });

  const insurancePolicy = applicationPaymentData?.insurance_policy[0];

  const watchSummaryData = useWatchSummaryInsuranceApplicationSubscription({
    variables: {
      id: params.id,
    },
    skip: insurancePolicy?.canary_token &&
      insurancePolicy?.policy_number &&
      insurancePolicy?.long_policy_number
      ? true
      : false,
  });

  const {
    data: summaryData,
    error: summaryDataError,
    loading,
  } = watchSummaryData.data ? watchSummaryData : useSummaryData;

  const bindStageLoading = bindLoading || agentBindLoading || loading;

  const getSignatures = applicationPaymentData?.insurance_policy[0];

  const handleBackOnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    handleStageChange("quote");
  };
  const handleBindOnClick = async (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const createdData = await bindInsuranceApplication({
      variables: {
        applicationId: params.id,
        insuranceQuoteSelectionId:
          summaryData?.insurance_application_by_pk?.insurance_quote_selection
            ?.id!,
        brokerEmail: loggedUser?.username || "",
        payer: event.currentTarget.id,
      },
    });
    if (!bindError) {
      setBindDialog(true);
    }
  };

  const handleAgentBindOnClick = async (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const createdData = await agentBindInsuranceApplication({
      variables: {
        applicationId: params.id,
        insuranceQuoteSelectionId:
          summaryData?.insurance_application_by_pk?.insurance_quote_selection
            ?.id.toString()!,
      },
    });
    console.log("Agent bind result");
    console.log(createdData);
    // if (!agentBindError) {
    //   setBindDialog(true);
    // }
  };

  const handleDialogClose = () => {
    setBindDialog(false);
  };

  const scanVirdict = (scanVirdict: any) => {
    switch (scanVirdict) {
      case "approve":
        return "Approved";
      case "reject":
        return "Rejected";
      case "pending":
        return "Pending";
      default:
        return "N/A";
    }
  };

  const agentSinged = getSignatures?.agent_signed ? true : false;

  function CopytoClipBoard(value: string) {
    navigator.clipboard.writeText(value);
  }

  const premiumAmount =
    summaryData?.insurance_application_by_pk?.insurance_quote_selection
      ?.insurance_quote?.premium !== "$0" || ""
      ? false
      : true;
  const getExternal_id = //@ts-ignore
    summaryData?.insurance_application_by_pk?.external_scans[0]?.external_id ||
    undefined;

  const getPercentage = (value: any) => {
    const numericValue = value * 100;
    return `${numericValue.toFixed(2)}%`;
  };

  const quoteFees =
    summaryData?.insurance_application_by_pk?.insurance_quote_selection
      ?.insurance_quote?.fees?.items || [];
  const taxes =
    summaryData?.insurance_application_by_pk?.insurance_quote_selection
      ?.insurance_quote.taxes;
  const taxLabel = taxes?.label || "Tax";

  return (
    <>
      <Card shadow={false}>
        <ErrorToast
          error={bindError}
          processCustomError={() => `Error - ${bindError?.message}`}
        />
        <ErrorToast
          error={summaryDataError}
          processCustomError={() =>
            `Cannot load summary details - ${bindError?.message}`
          }
        />

        {bindStageLoading ? (
          <LoadingBindStatus />
        ) : (
          <div className="bind-status-card">
            <Card shadow={false} legendTitle="Bind Status">
              <Grid container justifyContent="center">
                <div className={classes.bindBadgeWrapper}>
                  <GetStatusIcon
                    status={getSignatures?.agent_signed}
                    statusType="agent_signed"
                  />
                  <span>Agent Signed</span>
                </div>
                {
                  summaryData?.insurance_application_by_pk?.broker_agency?.payment_option === "insured_paid" &&
                  <>
                    <div className={classes.bindBadgeWrapper}>
                      <GetStatusIcon
                        status={getSignatures?.insured_signed}
                        statusType="insured_signed"
                      />
                      <span>Insured Signed</span>
                    </div>
                    <div className={classes.bindBadgeWrapper}>
                      <GetStatusIcon
                        status={getSignatures?.payment_collected}
                        statusType="payment"
                      />
                      <span>Payment Collected</span>
                    </div>
                  </>
                }
              </Grid>
            </Card>
          </div>
        )}

        <Grid container spacing={2}>
          <Grid sx={{ md: 6, xs: 12, marginTop: "2rem" }}>
            <GridItem>
              {bindStageLoading ? (
                <LoadingBindTableInfor />
              ) : (
                <div className="application-summary-card">
                  <Card
                    shadow={false}
                    legendTitle="Company Information"
                    fullHeight={true}
                  >
                    <Grid container style={{ padding: "1rem 0rem" }}>
                      <GridRow
                        name={"Organization Name"}
                        value={
                          summaryData?.insurance_application_by_pk
                            ?.insured_organization?.name
                        }
                      />
                      <GridRow
                        name={"Address"}
                        value={`${summaryData?.insurance_application_by_pk?.insured_organization?.address}, ${summaryData?.insurance_application_by_pk?.insured_organization?.city}, ${summaryData?.insurance_application_by_pk?.insured_organization?.state} ${summaryData?.insurance_application_by_pk?.insured_organization?.zip}`}
                      />
                      <GridRow
                        name={"Domain"}
                        value={summaryData?.insurance_application_by_pk?.domain}
                      />
                      <GridRow
                        name={"Industry"}
                        value={summaryData?.insurance_application_by_pk?.industry}
                      />
                      <GridRow
                        name={"Revenue"}
                        value={currencyFormatter(summaryData?.insurance_application_by_pk?.revenue)}
                      />
                      <GridRow
                        name={"Number of Employees"}
                        value={
                          summaryData?.insurance_application_by_pk?.employees
                        }
                      />
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            className={`${classes.fontLight} ${classes.gridRow}`}
                          >
                            Scan Verdict
                          </Typography>
                        </GridItem>
                      </Grid>
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            align="right"
                            className={classes.gridRow}
                          >
                            <IconButton
                              size="small"
                              title="View Details"
                              style={{
                                position: "relative",
                                top: -1,
                                marginRight: 5,
                              }}
                              onClick={() => setShowScanVerdict(true)}
                            >
                              <DescriptionOutlinedIcon
                                fontSize="small"
                                color="action"
                              />
                            </IconButton>
                            {scanVirdict(
                              summaryData?.insurance_application_by_pk
                                ?.external_scans[0]?.scan_result?.verdict
                            )}
                          </Typography>
                        </GridItem>
                      </Grid>

                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            className={`${classes.fontLight} ${classes.gridRow}`}
                          >
                            Claims URL
                          </Typography>
                        </GridItem>
                      </Grid>
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            align="right"
                            className={classes.gridRow}
                          >
                            {summaryData?.insurance_application_by_pk
                              ?.insurance_quote_selection?.insurance_policy
                              ?.canary_token ? (
                              <Tooltip title="Go to Claim URL">
                                <a
                                  href={`${summaryData?.insurance_application_by_pk?.insurance_quote_selection?.insurance_policy?.canary_token}`}
                                  target="_blank"
                                  className="claim-url"
                                >
                                  <LaunchOutlinedIcon fontSize="small" />
                                </a>
                              </Tooltip>
                            ) : (
                              "N/A"
                            )}
                          </Typography>
                        </GridItem>
                      </Grid>
                    </Grid>
                  </Card>
                </div>
              )}
            </GridItem>
          </Grid>

          <Grid sx={{ md: 6, xs: 12, marginTop: "2rem" }}>
            <GridItem>
              {bindStageLoading ? (
                <LoadingBindTableInfor />
              ) : (
                <div className="application-summary-card">
                  <Card
                    shadow={false}
                    legendTitle="Coverage Summary"
                    fullHeight={true}
                  >
                    <Grid container style={{ padding: "1rem 0rem" }}>
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            className={`${classes.fontLight} ${classes.gridRow}`}
                          >
                            Policy Number
                          </Typography>
                        </GridItem>
                      </Grid>
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <div className="flex justify-flex-end custom-space">
                            <div>
                              {summaryData?.insurance_application_by_pk
                                ?.insurance_quote_selection?.insurance_policy
                                ?.long_policy_number ? (
                                <Tooltip title="Copy long policy number">
                                  <div
                                    className="copy-policy-number"
                                    onClick={() =>
                                      CopytoClipBoard(
                                        `${summaryData?.insurance_application_by_pk?.insurance_quote_selection?.insurance_policy?.long_policy_number}`
                                      )
                                    }
                                  >
                                    <img src={CopyIcon} />
                                  </div>
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </div>
                            <div>
                              {summaryData?.insurance_application_by_pk
                                ?.insurance_quote_selection?.insurance_policy
                                ?.policy_number
                                ? summaryData?.insurance_application_by_pk
                                  ?.insurance_quote_selection?.insurance_policy
                                  ?.policy_number
                                : "N/A"}
                            </div>
                          </div>
                        </GridItem>
                      </Grid>
                      <GridRow
                        name={"Effective Date"}
                        value={
                          summaryData?.insurance_application_by_pk?.effective_date
                        }
                      />
                      <GridRow
                        name={"Expiration Date"}
                        value={
                          summaryData?.insurance_application_by_pk
                            ?.expiration_date
                        }
                      />
                      <GridRow
                        name={"Policy Limit"}
                        value={currencyFormatter(
                          summaryData?.insurance_application_by_pk
                            ?.insurance_quote_selection?.insurance_quote
                            ?.policy_limit
                        )
                        }
                      />

                      <GridRow
                        name={"Deductible"}
                        value={
                          currencyFormatter(
                            summaryData?.insurance_application_by_pk
                              ?.insurance_quote_selection?.insurance_quote
                              ?.deductible)
                        }
                      />

                      {quoteFees?.map((fee: any) => (
                        <React.Fragment key={fee.id}>
                          <GridRow
                            name={
                              fee.rate
                                ? `${fee.name} (${getPercentage(fee.rate)})`
                                : fee.name
                            }
                            value={`$${fee.amount !== undefined &&
                              //Number(fee.amount).toFixed(2)
                              currencyFormatterWithCents(String(fee.amount))
                              }`}
                          />
                        </React.Fragment>
                      ))}
                      {taxes ? (
                        <GridRow
                          name={`${taxLabel} (${getPercentage(taxes.rate)})`}
                          value={`$${taxes.amount !== undefined &&
                            //Number(taxes.amount).toFixed(2)
                            currencyFormatterWithCents(taxes.amount)
                            }`}
                        />
                      ) : (
                        <GridRow name={"Tax (0%)"} value={"$0.00"} />
                      )}

                      <GridRow
                        name={"Premium"}
                        value={
                          currencyFormatterWithCents(
                            summaryData?.insurance_application_by_pk
                              ?.insurance_quote_selection?.insurance_quote?.premium
                          )
                        }
                      />
                      <Grid sx={{ xs: 12 }}>
                        <GridItem className={classes.gridRow}>
                          <Divider />
                        </GridItem>
                      </Grid>

                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            className={`${classes.gridRow}`}
                          >
                            Total Due
                          </Typography>
                        </GridItem>
                      </Grid>
                      <Grid sx={{ sm: 6, xs: 12 }}>
                        <GridItem>
                          <Typography
                            variant="body2"
                            align="right"
                            className={classes.gridRow}
                          >
                            {
                              currencyFormatterWithCents(
                                summaryData?.insurance_application_by_pk
                                  ?.insurance_quote_selection?.insurance_quote
                                  ?.total_premium
                              )
                            }
                          </Typography>
                        </GridItem>
                      </Grid>

                      <Grid sx={{ xs: 12 }}>
                        <GridItem className={classes.gridRow}>
                          <Divider style={{ marginBottom: "3px" }} />
                          <Divider />
                        </GridItem>
                      </Grid>
                    </Grid>
                  </Card>
                </div>
              )}
            </GridItem>
          </Grid>
        </Grid>
        <Grid container spacing={2} style={{ marginTop: "2rem" }}>
          <Grid sx={{ xs: 12 }}>
            <GridItem>
              {bindStageLoading ? (
                <LoadingBindStatus />
              ) : (
                <div className="paymentBtnBlock">
                  <Card shadow={false} legendTitle="Bind">
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="center"
                      style={{ paddingTop: "1rem" }}
                    >
                      {
                        summaryData?.insurance_application_by_pk?.broker_agency?.payment_option === "insured_paid" &&
                        <>
                          {!(
                            policyData &&
                            policyData.ipfs_quote_data &&
                            policyData.ipfs_quote_data.ESignResult
                          ) && (
                              <Grid sx={{ xs: 6 }}>
                                <GridItem className={classes.paymentContainer}>
                                  <FeatureFlag
                                    roles={["admin", "broker"]}
                                    fallbackRender={() => (
                                      <>
                                        <Button
                                          className={`${classes.button} ${classes.paymentButton}`}
                                          color="primary"
                                          size="small"
                                          variant="contained"
                                          disabled={true}
                                          fullWidth
                                        >
                                          Bind & Send Payment Info to Insured
                                        </Button>
                                      </>
                                    )}
                                  >
                                    <Button
                                      id="Insured"
                                      className={`${classes.button} ${classes.paymentButton}`}
                                      color="primary"
                                      size="small"
                                      variant="contained"
                                      fullWidth
                                      onClick={handleBindOnClick}
                                      disabled={
                                        bindLoading || agentSinged || premiumAmount
                                      }
                                    >
                                      {bindLoading ? (
                                        <CircularProgress size={30} />
                                      ) : (
                                        "Bind & Send Payment Info to Insured"
                                      )}
                                    </Button>
                                  </FeatureFlag>
                                </GridItem>
                              </Grid>
                            )}
                          {policyData &&
                            policyData.ipfs_quote_data &&
                            policyData.ipfs_quote_data.ESignResult && (
                              <>
                                <PaymentDialog
                                  open={bindDialog}
                                  handleClose={handleDialogClose}
                                  agentUrl={
                                    policyData.ipfs_quote_data!.ESignResult.AgentURL
                                      ?.$
                                  }
                                  insuredUrl={
                                    policyData.ipfs_quote_data!.ESignResult.InsuredURL
                                      ?.$
                                  }
                                />
                                <Grid sx={{ xs: 12 }}>
                                  <GridItem className={classes.paymentContainer}>
                                    <Button
                                      className={`${classes.button} ${classes.paymentButton}`}
                                      color="primary"
                                      size="small"
                                      variant="contained"
                                      fullWidth
                                      // onClick={handleDownloadOnClick}
                                      disabled={
                                        getSignatures?.payment_collected === true ||
                                        agentSinged ||
                                        premiumAmount
                                      }
                                    >
                                      Bind & Send Payment Info to Insured
                                    </Button>
                                  </GridItem>
                                </Grid>
                              </>
                            )}
                        </>
                      }
                      {
                        summaryData?.insurance_application_by_pk?.broker_agency?.payment_option === "agent_paid" &&
                        <>
                          {!(
                            policyData &&
                            policyData.ipfs_quote_data &&
                            policyData.ipfs_quote_data.ESignResult
                          ) && (
                              <Grid sx={{ xs: 6 }}>
                                <GridItem className={classes.paymentContainer}>
                                  <FeatureFlag
                                    roles={["admin", "broker"]}
                                    fallbackRender={() => (
                                      <>
                                        <Button
                                          className={`${classes.button} ${classes.paymentButton}`}
                                          color="primary"
                                          size="small"
                                          variant="contained"
                                          disabled={true}
                                          fullWidth
                                        >
                                          Bind & Issue Policy
                                        </Button>
                                      </>
                                    )}
                                  >
                                    <Button
                                      id="Insured"
                                      className={`${classes.button} ${classes.paymentButton}`}
                                      color="primary"
                                      size="small"
                                      variant="contained"
                                      fullWidth
                                      onClick={handleAgentBindOnClick}
                                      disabled={
                                        agentBindLoading || agentSinged || premiumAmount
                                      }
                                    >
                                      {agentBindLoading ? (
                                        <CircularProgress size={30} />
                                      ) : (
                                        "Bind & Issue Policy"
                                      )}
                                    </Button>
                                  </FeatureFlag>
                                </GridItem>
                              </Grid>
                            )}
                          {policyData &&
                            policyData.ipfs_quote_data &&
                            policyData.ipfs_quote_data.ESignResult && (
                              <>
                                <PaymentDialog
                                  open={bindDialog}
                                  handleClose={handleDialogClose}
                                  agentUrl={
                                    policyData.ipfs_quote_data!.ESignResult.AgentURL
                                      ?.$
                                  }
                                  insuredUrl={
                                    policyData.ipfs_quote_data!.ESignResult.InsuredURL
                                      ?.$
                                  }
                                />
                                <Grid sx={{ xs: 12 }}>
                                  <GridItem className={classes.paymentContainer}>
                                    <Button
                                      className={`${classes.button} ${classes.paymentButton}`}
                                      color="primary"
                                      size="small"
                                      variant="contained"
                                      fullWidth
                                      // onClick={handleAgentBindOnClick}
                                      disabled={
                                        getSignatures?.payment_collected === true ||
                                        agentSinged ||
                                        premiumAmount
                                      }
                                    >
                                      Bind & Issue Policy
                                    </Button>
                                  </GridItem>
                                </Grid>
                              </>
                            )}
                        </>
                      }
                    </Grid>
                  </Card>
                </div>
              )}
            </GridItem>
          </Grid>
        </Grid>

        <ButtonsContainer>
          <Button
            className={classes.button}
            color="primary"
            onClick={handleBackOnClick}
            variant="contained"
            disabled={
              (policyData && policyData.stage === "issued" ? true : false) ||
              bindLoading
            }
          >
            {bindLoading ? <CircularProgress size={30} /> : "Back"}
          </Button>
          <FeatureFlag
            roles={["admin", "broker"]}
            fallbackRender={() => (
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={handleBindOnClick}
                disabled={true}
              >
                {bindLoading ? <CircularProgress size={30} /> : "Bind"}
              </Button>
            )}
          ></FeatureFlag>
        </ButtonsContainer>
      </Card>
      {showScanVerdict && (
        <ScanVerdictDetailModal
          showModal={showScanVerdict}
          external_id={getExternal_id}
          setShowModal={() => setShowScanVerdict(false)}
        />
      )}
    </>
  );
};

export default Bind;
